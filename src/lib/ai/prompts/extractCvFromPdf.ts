import { MasterProfileSchema, type MasterProfileData } from '../_shared/masterProfileSchema'
import { ANTI_HALLUCINATION_FRAGMENT } from '../_shared/antiHallucination'
import { runPrompt } from '../runner'

const SYSTEM_PROMPT = `You are a precise CV data extractor. Your task is to extract structured professional profile information from a CV or resume document.

${ANTI_HALLUCINATION_FRAGMENT}
- Group skills by category as they appear in the CV (e.g. "Programming Languages", "Frameworks", "Tools"). If no categories exist, group logically.
- You MUST call the extract_cv_data tool with the extracted data.`

export async function extractCvFromPdf(pdfBase64: string): Promise<MasterProfileData> {
  return runPrompt({
    mode: 'tool',
    toolName: 'extract_cv_data',
    toolDescription: 'Extract structured professional profile data from a CV/resume.',
    schema: MasterProfileSchema,
    system: SYSTEM_PROMPT,
    maxTokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          { type: 'text', text: 'Extract all professional profile data from this CV using the extract_cv_data tool.' },
        ],
      },
    ],
  })
}
