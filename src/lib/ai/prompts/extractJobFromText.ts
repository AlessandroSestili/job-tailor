import { JobDescriptionSchema, type JobData } from '../_shared/jobDescriptionSchema'
import { runPrompt } from '../runner'

const SYSTEM_PROMPT = `You are a precise job posting data extractor. Extract structured information from a job posting.

STRICT RULES:
- Extract ONLY information explicitly present in the text. Do not infer or fabricate.
- For the "language" field: detect the language of the job posting and return its ISO 639-1 code (e.g. "en", "it", "fr", "de", "es").
- For the "tone" field: infer from writing style — "startup" (informal, fast-paced), "corporate" (formal, hierarchical), "academic" (research-oriented), "public_sector" (bureaucratic), or "neutral".
- For requirements vs nice_to_have: use explicit signals ("required", "must have" → requirements; "nice to have", "preferred", "bonus" → nice_to_have). If unclear, put in requirements.
- You MUST call the extract_job_data tool with the extracted data.`

export async function extractJobFromText(text: string): Promise<JobData> {
  return runPrompt({
    mode: 'tool',
    toolName: 'extract_job_data',
    toolDescription: 'Extract structured job description data from a job posting.',
    schema: JobDescriptionSchema,
    system: SYSTEM_PROMPT,
    maxTokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Extract all job description data from this posting using the extract_job_data tool:\n\n${text}`,
      },
    ],
  })
}
