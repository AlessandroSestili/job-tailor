import { TailoredCvSchema, type TailoredCvData } from '../_shared/tailoredCvSchema'
import { ANTI_HALLUCINATION_FRAGMENT } from '../_shared/antiHallucination'
import { LANGUAGE_MATCH_RULE } from '../_shared/languageRule'
import type { MasterProfileData } from '../_shared/masterProfileSchema'
import type { JobData } from '../_shared/jobDescriptionSchema'
import { runPrompt } from '../runner'

const SYSTEM_PROMPT = `You are an expert CV writer and career coach. Your task is to produce a tailored CV that maximizes the candidate's fit for a specific job posting.

${ANTI_HALLUCINATION_FRAGMENT}

${LANGUAGE_MATCH_RULE}

TAILORING RULES:
- Reorder work experience bullet points to highlight achievements most relevant to the job requirements first.
- Reorder skills groups and items to surface the most relevant skills first.
- Rephrase achievements using keywords from the job description where it truthfully fits (e.g. if the job says "cross-functional teams" and the candidate worked with multiple teams, use that phrasing).
- Write a targeted summary (2-3 sentences) that connects the candidate's strongest relevant points to the job's key requirements.
- Omit irrelevant skills and experiences only if the CV would otherwise be too long (>2 pages). Never omit education or notable achievements.
- Adapt the tone to match the job's context (startup vs corporate vs academic vs public sector).
- You MUST call the generate_tailored_cv tool with the result.`

export async function generateTailoredCv(
  profile: MasterProfileData,
  job: JobData
): Promise<TailoredCvData> {
  return runPrompt({
    mode: 'tool',
    toolName: 'generate_tailored_cv',
    toolDescription: 'Generate a tailored CV JSON optimized for a specific job posting.',
    schema: TailoredCvSchema,
    system: SYSTEM_PROMPT,
    maxTokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Generate a tailored CV for the following job posting using the generate_tailored_cv tool.

## MASTER PROFILE
${JSON.stringify(profile, null, 2)}

## JOB DESCRIPTION
${JSON.stringify(job, null, 2)}`,
      },
    ],
  })
}
