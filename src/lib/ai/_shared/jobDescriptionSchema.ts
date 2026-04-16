import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type Anthropic from '@anthropic-ai/sdk'

export const JobDescriptionSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  employment_type: z
    .enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'])
    .optional(),
  language: z.string(), // ISO 639-1 code, e.g. "en", "it", "fr"
  summary: z.string().optional(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  nice_to_have: z.array(z.string()).default([]),
  tone: z
    .enum(['startup', 'corporate', 'academic', 'public_sector', 'neutral'])
    .optional(),
  salary_range: z.string().optional(),
  remote_policy: z.enum(['remote', 'hybrid', 'onsite']).optional(),
})

export type JobData = z.infer<typeof JobDescriptionSchema>

// ─── Anthropic tool input_schema ──────────────────────────────────────────────

const _raw = zodToJsonSchema(JobDescriptionSchema, { $refStrategy: 'none' }) as {
  type: string
  properties: Record<string, unknown>
  required?: string[]
}

export const jobDescriptionInputSchema: Anthropic.Tool['input_schema'] = {
  type: 'object',
  properties: _raw.properties,
  required: _raw.required ?? [],
}
