import type { MasterProfileData } from '@/lib/ai/_shared/masterProfileSchema'
import type { JobData } from '@/lib/ai/_shared/jobDescriptionSchema'
import type { TailoredCvData } from '@/lib/ai/_shared/tailoredCvSchema'

// ─── Row types (mirror DB columns) ────────────────────────────────────────────

export type UserRow = {
  id: string
  email: string
  created_at: string
}

export type MasterProfileRow = {
  id: string
  user_id: string
  structured_data: MasterProfileData
  raw_cv_url: string | null
  free_text: string | null
  preferences: UserPreferences
  updated_at: string
}

export type JobRow = {
  id: string
  user_id: string
  source_type: 'url' | 'text' | 'form'
  source_value: string
  structured_data: JobData
  created_at: string
}

export type GenerationRow = {
  id: string
  user_id: string
  master_profile_id: string
  job_id: string
  tailored_cv: TailoredCvData
  cover_letter: string
  cv_pdf_url: string | null
  feedback: string | null
  created_at: string
}

// ─── Nested types ─────────────────────────────────────────────────────────────

export type UserPreferences = {
  tone?: 'formal' | 'neutral' | 'conversational' | 'startup'
  target_sectors?: string[]
  remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any'
  target_languages?: string[]
}

// ─── Insert payloads (omit server-generated fields) ───────────────────────────

export type InsertMasterProfile = Omit<MasterProfileRow, 'id' | 'updated_at'>
export type InsertJob = Omit<JobRow, 'id' | 'created_at'>
export type InsertGeneration = Omit<GenerationRow, 'id' | 'created_at'>
