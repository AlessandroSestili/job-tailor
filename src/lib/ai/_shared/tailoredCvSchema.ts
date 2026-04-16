import { z } from 'zod'
import {
  PersonalBaseSchema,
  WorkExperienceBaseSchema,
  EducationBaseSchema,
  SkillGroupSchema,
  LanguageSchema,
  CertificationBaseSchema,
  ProjectBaseSchema,
} from './cvBaseSchemas'

// TailoredCvSchema derives from the same base schemas as MasterProfileSchema.
//
// Differences from Master:
//   - personal has no summary (it's a top-level field written by the AI)
//   - experience and education have no description (not needed in final output)
//   - certifications and projects default to [] (AI may omit them)

export const TailoredCvSchema = z.object({
  personal: PersonalBaseSchema, // no .summary — summary is top-level
  summary: z.string().optional(), // AI-written targeted summary for the specific job
  experience: z.array(WorkExperienceBaseSchema),
  education: z.array(EducationBaseSchema),
  skills: z.array(SkillGroupSchema),
  languages: z.array(LanguageSchema),
  certifications: z.array(CertificationBaseSchema).default([]),
  projects: z.array(ProjectBaseSchema).default([]),
})

export type TailoredCvData = z.infer<typeof TailoredCvSchema>
