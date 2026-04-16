import { ANTI_HALLUCINATION_FRAGMENT } from '../_shared/antiHallucination'
import { LANGUAGE_MATCH_RULE } from '../_shared/languageRule'
import type { MasterProfileData } from '../_shared/masterProfileSchema'
import type { JobData } from '../_shared/jobDescriptionSchema'
import { runPrompt } from '../runner'

const SYSTEM_PROMPT = `You are an expert cover letter writer. Your task is to write a compelling, personalized cover letter for a specific job application.

${ANTI_HALLUCINATION_FRAGMENT}

${LANGUAGE_MATCH_RULE}

COVER LETTER RULES:
- Length: 3-4 paragraphs, max 350 words.
- Structure: opening hook → why this company/role → most relevant 2-3 achievements → closing with call to action.
- Opening: do NOT start with "I am writing to apply for...". Be specific and engaging.
- Reference the company by name and show genuine understanding of what they do or what the role entails.
- Map the candidate's most relevant experience and achievements to the job's key requirements.
- Adapt the tone to the job's context: conversational for startups, formal for corporate/public sector.
- Return ONLY the cover letter text — no subject line, no "Dear Hiring Manager" unless the job suggests it, no metadata.`

export async function generateCoverLetter(
  profile: MasterProfileData,
  job: JobData
): Promise<string> {
  return runPrompt({
    mode: 'text',
    system: SYSTEM_PROMPT,
    maxTokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Write a cover letter for the following application.

## MASTER PROFILE
${JSON.stringify(profile, null, 2)}

## JOB DESCRIPTION
${JSON.stringify(job, null, 2)}`,
      },
    ],
  })
}
