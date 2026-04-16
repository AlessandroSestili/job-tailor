import { extractJobFromText } from '../src/lib/ai/prompts/extractJobFromText'

const SAMPLE_JOB = `
Senior Frontend Engineer — Acme Corp (Remote)

We're looking for a Senior Frontend Engineer to join our product team and help us build the next generation of our SaaS platform.

About the role:
- Lead the frontend architecture of our core product
- Collaborate with designers and backend engineers to ship features fast
- Mentor junior developers

Requirements:
- 5+ years of experience with React and TypeScript
- Strong understanding of performance optimization and Core Web Vitals
- Experience with REST APIs and state management (Redux, Zustand, or similar)
- Excellent communication skills

Nice to have:
- Experience with Next.js
- GraphQL knowledge
- Familiarity with design systems (Figma to code)

Compensation: €70k–€90k / year
`

async function main() {
  console.log('Sending job posting to Claude for extraction...\n')
  const result = await extractJobFromText(SAMPLE_JOB)

  console.log('=== EXTRACTED JOB DESCRIPTION ===\n')
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
