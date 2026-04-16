import type Anthropic from '@anthropic-ai/sdk'
import { type ZodTypeAny, type z, ZodError } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { getAnthropicClient, DEFAULT_MODEL } from './client'

// ─── Error hierarchy ──────────────────────────────────────────────────────────

/** Base class for all AI runner errors. Catch this for any AI failure. */
export class AiRunnerError extends Error {
  // `cause` is passed to Error constructor (ES2022) — declare here for typing
  declare cause: unknown
  constructor(message: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'AiRunnerError'
  }
}

/** Model responded with text instead of calling the required tool. */
export class AiToolNotCalledError extends AiRunnerError {
  constructor(toolName: string) {
    super(`Model did not call tool "${toolName}". Response contained no tool_use block.`)
    this.name = 'AiToolNotCalledError'
  }
}

/** Model returned no text block (text mode). */
export class AiNoTextError extends AiRunnerError {
  constructor() {
    super('Model returned no text content block.')
    this.name = 'AiNoTextError'
  }
}

/** Tool output failed Zod schema validation. `.raw` contains the model's raw output. */
export class AiParseError extends AiRunnerError {
  readonly raw: unknown
  constructor(cause: ZodError, raw: unknown) {
    super(`Tool output failed schema validation: ${cause.message}`, cause)
    this.name = 'AiParseError'
    this.raw = raw
  }
}

/** Anthropic API call failed (network, auth, rate limit). */
export class AiApiError extends AiRunnerError {
  constructor(cause: unknown) {
    super(
      `Anthropic API call failed: ${cause instanceof Error ? cause.message : String(cause)}`,
      cause
    )
    this.name = 'AiApiError'
  }
}

// ─── Run options ──────────────────────────────────────────────────────────────

interface BaseOpts {
  system: string
  messages: Anthropic.MessageParam[]
  model?: string
  maxTokens?: number
}

export interface ToolRunOpts<TSchema extends ZodTypeAny> extends BaseOpts {
  mode: 'tool'
  toolName: string
  toolDescription: string
  schema: TSchema
}

export interface TextRunOpts extends BaseOpts {
  mode: 'text'
}

// ─── Return type conditioned on mode ─────────────────────────────────────────

type RunResult<TSchema extends ZodTypeAny, TOpts> =
  TOpts extends ToolRunOpts<TSchema> ? z.infer<TSchema> : string

// ─── Optional meta hook ───────────────────────────────────────────────────────

export interface RunMeta {
  model: string
  durationMs: number
  inputTokens: number
  outputTokens: number
  /** True when a cache read occurred (prompt caching) */
  cacheHit: boolean
}

/** Set once at module level to receive telemetry from every run. */
export let onRunComplete: ((meta: RunMeta) => void) | undefined

export function setRunCompleteHook(fn: typeof onRunComplete) {
  onRunComplete = fn
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * runPrompt — single entry point for all Claude API calls.
 *
 * Tool mode:  pass mode:'tool' + schema → returns z.infer<schema>
 * Text mode:  pass mode:'text'          → returns string
 *
 * @param opts   - prompt definition (system, messages, tool or text mode)
 * @param client - optional Anthropic client (inject in tests; production omits this)
 */
export async function runPrompt<
  TSchema extends ZodTypeAny,
  TOpts extends ToolRunOpts<TSchema> | TextRunOpts,
>(opts: TOpts, client?: Anthropic): Promise<RunResult<TSchema, TOpts>> {
  const anthropic = client ?? getAnthropicClient()
  const model = opts.model ?? DEFAULT_MODEL
  const start = Date.now()

  let response: Anthropic.Message

  try {
    if (opts.mode === 'tool') {
      // Derive input_schema from Zod at call time — prompt files never import zodToJsonSchema
      const raw = zodToJsonSchema(opts.schema, { $refStrategy: 'none' }) as {
        type: string
        properties: Record<string, unknown>
        required?: string[]
      }
      const tool: Anthropic.Tool = {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: {
          type: 'object',
          properties: raw.properties,
          required: raw.required ?? [],
        },
      }

      response = await anthropic.messages.create({
        model,
        max_tokens: opts.maxTokens ?? 4096,
        system: opts.system,
        tools: [tool],
        tool_choice: { type: 'any' },
        messages: opts.messages,
      })
    } else {
      response = await anthropic.messages.create({
        model,
        max_tokens: opts.maxTokens ?? 1024,
        system: opts.system,
        messages: opts.messages,
      })
    }
  } catch (err) {
    throw new AiApiError(err)
  }

  // ─── Fire telemetry hook ─────────────────────────────────────────────────

  const usage = response.usage as Anthropic.Usage & { cache_read_input_tokens?: number }
  const meta: RunMeta = {
    model,
    durationMs: Date.now() - start,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheHit: (usage.cache_read_input_tokens ?? 0) > 0,
  }
  onRunComplete?.(meta)

  // ─── Extract result ──────────────────────────────────────────────────────

  if (opts.mode === 'tool') {
    const block = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )
    if (!block) throw new AiToolNotCalledError(opts.toolName)

    const parsed = opts.schema.safeParse(block.input)
    if (!parsed.success) throw new AiParseError(parsed.error, block.input)

    return parsed.data as RunResult<TSchema, TOpts>
  }

  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block) throw new AiNoTextError()

  return block.text.trim() as RunResult<TSchema, TOpts>
}
