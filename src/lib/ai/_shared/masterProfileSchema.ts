import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type Anthropic from '@anthropic-ai/sdk'

// ─── Sub-schemas ───────────────────────────────────────────────────────────────

const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  website: z.string().optional(),
  summary: z.string().optional(),
})

const WorkExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  start_date: z.string(), // "YYYY-MM" or "YYYY"
  end_date: z.string().optional(), // omit if current
  current: z.boolean(),
  description: z.string().optional(),
  achievements: z.array(z.string()),
})

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
})

const SkillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

const LanguageSchema = z.object({
  language: z.string(),
  level: z.string(), // "Native" | "Fluent" | "Professional" | "Conversational" | "Basic"
})

const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
})

const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
  date: z.string().optional(),
})

// ─── Master schema ─────────────────────────────────────────────────────────────

export const MasterProfileSchema = z.object({
  personal: PersonalInfoSchema,
  experience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillGroupSchema),
  languages: z.array(LanguageSchema),
  certifications: z.array(CertificationSchema),
  projects: z.array(ProjectSchema),
})

export type MasterProfileData = z.infer<typeof MasterProfileSchema>

// ─── Anthropic tool input_schema ──────────────────────────────────────────────
// zodToJsonSchema with $refStrategy:'none' inlines all nested schemas — required
// by Anthropic which does not support $ref or $defs in tool definitions.

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
