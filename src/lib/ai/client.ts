import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

/**
 * Lazy singleton Anthropic client. Reads ANTHROPIC_API_KEY from env on first call.
 * Safe for Next.js App Router — no per-request state on the client instance.
 */
export function getAnthropicClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

export const DEFAULT_MODEL = 'claude-sonnet-4-5'
