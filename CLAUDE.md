# job-tailor

> Next.js 16 breaking changes. Read `node_modules/next/dist/docs/` before writing Next.js code. Read `BRIEF.md` before changes.

## Commands
```bash
pnpm dev
pnpm build
pnpm lint                  # fix errors, warnings ok
pnpm test:extract-cv       # AI test (needs .env.local)
```

## Architecture
App Router monolith. `src/app/` pages, `src/components/ui/` shadcn, `src/lib/supabase/` client+server, `src/lib/ai/prompts/` one file per prompt, `scripts/` standalone tests, `fixtures/` sample PDFs.

## AI
Model: `claude-sonnet-4-5`. Prompts: `extractCvFromPdf` `extractJobFromText` `generateTailoredCv` `generateCoverLetter`.
**Non-negotiable**: never invent experiences/titles/companies/skills not in Master Profile.
Output language: match job description language.

## DB (Supabase)
Tables: `users` `master_profiles` `jobs` `generations`
`master_profiles.structured_data` — parsed CV JSON. `generations.tailored_cv` — output. PDFs in Storage.

Dev order (per BRIEF.md): prompt scripts → UI → PDF rendering.
