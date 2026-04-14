# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **IMPORTANT:** This project uses Next.js 16, which has breaking changes from earlier versions.
> Read `node_modules/next/dist/docs/` before writing any Next.js code. Heed deprecation notices.
> Read `BRIEF.md` for full product spec before making changes.

## Commands

```bash
pnpm dev                    # Next.js dev server
pnpm build
pnpm lint                   # ESLint — fix all errors, warnings are ok
pnpm test:extract-cv        # standalone AI extraction test (needs .env.local)
```

## Architecture

Next.js 16 App Router monolith. Key directories:

- `src/app/` — pages and layouts (App Router)
- `src/components/ui/` — shadcn/ui components
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (server-side)
- `src/lib/ai/prompts/` — one file per Claude prompt, versioned independently
- `scripts/` — standalone test scripts (`tsx --env-file=.env.local`)
- `fixtures/` — sample PDFs for prompt testing

## AI Prompts

Model: `claude-sonnet-4-5` via `@anthropic-ai/sdk`.

Prompts (in `src/lib/ai/prompts/`):
1. `extractCvFromPdf.ts` — Master Profile structured extraction from PDF
2. `extractJobFromText.ts` — Job Description structured extraction from text/HTML
3. `generateTailoredCv.ts` — Master Profile + Job → tailored CV JSON
4. `generateCoverLetter.ts` — cover letter in the job's language

**Anti-hallucination constraint** (non-negotiable): Claude may rephrase, reorder, emphasize, translate — but must never invent experiences, titles, companies, or skills not present in the Master Profile.

Output language: match the job description's language, not the user's.

## Database (Supabase)

Tables: `users`, `master_profiles`, `jobs`, `generations`

`master_profiles.structured_data` — parsed CV JSON + extra info  
`generations.tailored_cv` — structured CV output  
Raw CV PDFs and generated PDFs stored in Supabase Storage.

## Development Order

Per `BRIEF.md`: prompt scripts → UI → PDF rendering. Do not build UI until prompt scripts produce quality output.
