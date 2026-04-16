import { z } from 'zod'

/**
 * Shared leaf schemas — single source of truth for both
 * MasterProfileSchema and TailoredCvSchema.
 *
 * Each consuming schema imports these and uses .extend() only for
 * fields that genuinely differ (e.g. raw description fields present
 * in extraction but absent from generated output).
 */

export const PersonalBaseSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  website: z.string().optional(),
})

export const WorkExperienceBaseSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  start_date: z.string(), // "YYYY-MM" or "YYYY"
  end_date: z.string().optional(), // omit if current
  current: z.boolean(),
  achievements: z.array(z.string()),
})

export const EducationBaseSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  grade: z.string().optional(),
})

export const SkillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

export const LanguageSchema = z.object({
  language: z.string(),
  level: z.string(), // "Native" | "Fluent" | "Professional" | "Conversational" | "Basic"
})

export const CertificationBaseSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
})

export const ProjectBaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
})
