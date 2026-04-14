/**
 * Anti-hallucination rules — non-negotiable per BRIEF.md.
 * Claude may rephrase, reorder, emphasize, translate — but must never invent
 * experiences, titles, companies, or skills not present in the source.
 *
 * Compose into any system prompt that operates on user-provided documents.
 */
export const ANTI_HALLUCINATION_FRAGMENT = `STRICT RULES:
- Extract ONLY information explicitly present in the document. Never infer, invent, or add data not present.
- If a field is not present in the source, omit it (do not guess or fabricate).
- Preserve the original language of the content (do not translate).
- For dates, use "YYYY-MM" format when month is available, "YYYY" when only year is present.
- For achievements/bullet points: extract them verbatim or as close as possible. Preserve specificity (numbers, percentages, technologies, company names).`
