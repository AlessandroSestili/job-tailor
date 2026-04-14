import { extractCvFromPdf } from './prompts/extractCvFromPdf'
import type { MasterProfileData } from './_shared/masterProfileSchema'

export type { MasterProfileData } from './_shared/masterProfileSchema'

/**
 * Public AI client. Import only this — never import from prompts/ directly
 * in application code (scripts and tests may import prompts directly).
 *
 * Prompts not yet implemented will be added here as they are built.
 */
export const ai = {
  extractCvFromPdf,
} satisfies {
  extractCvFromPdf: (pdfBase64: string) => Promise<MasterProfileData>
}
