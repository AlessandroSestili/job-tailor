import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type Anthropic from '@anthropic-ai/sdk'
import {
  PersonalBaseSchema,
  WorkExperienceBaseSchema,
  EducationBaseSchema,
  SkillGroupSchema,
  LanguageSchema,
  CertificationBaseSchema,
  ProjectBaseSchema,
} from './cvBaseSchemas'

// Master profile extends base schemas with extraction-only fields:
// raw description text present in a CV but not emitted in tailored output.

export const MasterProfileSchema = z.object({
  personal: PersonalBaseSchema.extend({
    summary: z.string().optional(), // raw CV summary — replaced by AI-written one in tailored output
  }),
  experience: z.array(
    WorkExperienceBaseSchema.extend({
      description: z.string().optional(), // free-form role description, stripped in tailored output
    })
  ),
  education: z.array(
    EducationBaseSchema.extend({
      description: z.string().optional(),
    })
  ),
  skills: z.array(SkillGroupSchema),
  languages: z.array(LanguageSchema),
  certifications: z.array(
    CertificationBaseSchema.extend({
      url: z.string().optional(), // link to credential — present in master, omitted in output
    })
  ),
  projects: z.array(
    ProjectBaseSchema.extend({
      date: z.string().optional(), // only tracked in master profile
    })
  ),
})

export type MasterProfileData = z.infer<typeof MasterProfileSchema>

// ─── Anthropic tool input_schema ──────────────────────────────────────────────
// NOTE: runner.ts now derives input_schema from the Zod schema at call time.
// This export is kept for any code that needs the schema shape independently
// (e.g. documentation, validation endpoints).

const _raw = zodToJsonSchema(MasterProfileSchema, { $refStrategy: 'none' }) as {
  type: string
  properties: Record<string, unknown>
  required?: string[]
}

export const masterProfileInputSchema: Anthropic.Tool['input_schema'] = {
  type: 'object',
  properties: _raw.properties,
  required: _raw.required ?? [],
}
