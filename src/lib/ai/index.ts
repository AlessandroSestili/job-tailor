import { extractCvFromPdf } from './prompts/extractCvFromPdf'
import { extractJobFromText } from './prompts/extractJobFromText'
import { generateTailoredCv } from './prompts/generateTailoredCv'
import { generateCoverLetter } from './prompts/generateCoverLetter'
import type { MasterProfileData } from './_shared/masterProfileSchema'
import type { JobData } from './_shared/jobDescriptionSchema'
import type { TailoredCvData } from './_shared/tailoredCvSchema'

export type { MasterProfileData } from './_shared/masterProfileSchema'
export type { JobData } from './_shared/jobDescriptionSchema'
export type { TailoredCvData } from './_shared/tailoredCvSchema'

/**
 * Public AI client. Import only this in application code.
 * Scripts and tests may import from prompts/ directly.
 */
export const ai = {
  extractCvFromPdf,
  extractJobFromText,
  generateTailoredCv,
  generateCoverLetter,
} satisfies {
  extractCvFromPdf: (pdfBase64: string) => Promise<MasterProfileData>
  extractJobFromText: (text: string) => Promise<JobData>
  generateTailoredCv: (profile: MasterProfileData, job: JobData) => Promise<TailoredCvData>
  generateCoverLetter: (profile: MasterProfileData, job: JobData) => Promise<string>
}
