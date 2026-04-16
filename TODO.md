# JobTailor — Roadmap

## Step 1 — Setup repo
- [x] Next.js 16 + TS + Tailwind v4 + ESLint
- [x] Migrazione `app/` → `src/app/`
- [x] Aggiornamento tsconfig paths per `src/`
- [x] Installazione `@anthropic-ai/sdk`, `@supabase/supabase-js`, `@supabase/ssr`, `cheerio`
- [x] Installazione `prettier`, `prettier-plugin-tailwindcss`, `tsx`
- [x] `.env.local.example` + `.env.local` (da riempire)
- [x] `.prettierrc` + `.prettierignore`
- [x] `src/lib/supabase/client.ts` + `server.ts`
- [x] Struttura `src/lib/ai/prompts/`, `fixtures/`, `scripts/`
- [x] Vitest configurato (`pnpm test`)
- [ ] shadcn/ui init (da fare interattivamente: `pnpm dlx shadcn@latest init`)

## Step 2 — Script `extractCvFromPdf`
- [x] Prompt `src/lib/ai/prompts/extractCvFromPdf.ts`
- [x] Script `scripts/test-extract-cv.ts`
- [ ] Fixture PDF in `fixtures/` (richiesta per testare — aggiungere manualmente)
- [ ] Iterazione sul prompt dopo test con PDF reale

## Step 3 — Script `extractJobFromText`
- [x] Schema `src/lib/ai/_shared/jobDescriptionSchema.ts` + test
- [x] Prompt `src/lib/ai/prompts/extractJobFromText.ts`
- [x] Script `scripts/test-extract-job.ts` (`pnpm test:extract-job`)
- [ ] Iterazione sul prompt dopo test

## Step 4 — Script `generateTailoredCv` + `generateCoverLetter`
- [x] Schema `src/lib/ai/_shared/tailoredCvSchema.ts` + test
- [x] Prompt `src/lib/ai/prompts/generateTailoredCv.ts`
- [x] Prompt `src/lib/ai/prompts/generateCoverLetter.ts`
- [x] Script `scripts/test-generate.ts` (`pnpm test:generate`)
- [ ] Iterazione sul prompt dopo test

## Step DB — Database (Supabase)
- [x] Migration SQL `supabase/migrations/001_initial_schema.sql`
- [x] TypeScript types `src/lib/db/types.ts`
- [ ] Creare progetto Supabase su supabase.com
- [ ] Riempire `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Applicare migration (dashboard → SQL editor → incollare il file)
- [ ] Creare bucket Storage: `cv-uploads` e `cv-generated` (privati)

## Step 5 — UI
- [ ] Auth (login / signup con Supabase magic link + Google OAuth)
- [ ] Onboarding (upload CV + form info aggiuntive)
- [ ] Dashboard
- [ ] Generazione Application (input job + genera)
- [ ] Preview CV + cover letter
- [ ] Download PDF

## Step 6 — PDF rendering
- [ ] Template React ATS-friendly (`src/components/cv-template/`)
- [ ] Export PDF con `@react-pdf/renderer`

## Step 7 — Storico e rigenerazione
- [ ] Lista generazioni passate
- [ ] Duplica / rigenera con feedback
