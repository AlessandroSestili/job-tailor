import type Anthropic from '@anthropic-ai/sdk'
import { getAnthropicClient, DEFAULT_MODEL } from '../client'
import { masterProfileInputSchema, MasterProfileSchema, type MasterProfileData } from '../_shared/masterProfileSchema'
import { ANTI_HALLUCINATION_FRAGMENT } from '../_shared/antiHallucination'

const extractionTool: Anthropic.Tool = {
  name: 'extract_cv_data',
  description: 'Extract structured professional profile data from a CV/resume.',
  input_schema: masterProfileInputSchema,
}

const SYSTEM_PROMPT = `You are a precise CV data extractor. Your task is to extract structured professional profile information from a CV or resume document.

${ANTI_HALLUCINATION_FRAGMENT}
- Group skills by category as they appear in the CV (e.g. "Programming Languages", "Frameworks", "Tools"). If no categories exist, group logically.
- You MUST call the extract_cv_data tool with the extracted data.`

export async function extractCvFromPdf(pdfBase64: string): Promise<MasterProfileData> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [extractionTool],
    tool_choice: { type: 'any' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: 'Extract all professional profile data from this CV using the extract_cv_data tool.',
          },
        ],
      },
    ],
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Model did not call the extraction tool')
  }

  return MasterProfileSchema.parse(toolUse.input)
}
