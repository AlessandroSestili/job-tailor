/**
 * Language-matching rule — used by generation prompts (generateTailoredCv,
 * generateCoverLetter). Output language must match the job description's
 * language, not the user's CV language.
 */
export const LANGUAGE_MATCH_RULE = `OUTPUT LANGUAGE: Write the output in the same language as the job description, regardless of the language of the candidate's CV.`
