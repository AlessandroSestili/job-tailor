# JobTailor — Roadmap

## Step 1 — Setup repo
- [x] Next.js 16 + TS + Tailwind v4 + ESLint (già presenti)
- [x] Migrazione `app/` → `src/app/`
- [x] Aggiornamento tsconfig paths per `src/`
- [x] Installazione `@anthropic-ai/sdk`, `@supabase/supabase-js`, `@supabase/ssr`, `cheerio`
- [x] Installazione `prettier`, `prettier-plugin-tailwindcss`, `tsx`
- [x] `.env.local.example` + `.env.local` (da riempire)
- [x] `.prettierrc` + `.prettierignore`
- [x] `src/lib/supabase/client.ts` + `server.ts`
- [x] Struttura `src/lib/ai/prompts/`, `fixtures/`, `scripts/`
- [ ] shadcn/ui init (da fare interattivamente)

## Step 2 — Script `extractCvFromPdf`
- [ ] Prompt `src/lib/ai/prompts/extractCvFromPdf.ts`
- [ ] Script `scripts/test-extract-cv.ts`
- [ ] Iterazione sul prompt fino a output di qualità

## Step 3 — Script `extractJobFromText`
- [ ] Prompt `src/lib/ai/prompts/extractJobFromText.ts`
- [ ] Script `scripts/test-extract-job.ts`
- [ ] Iterazione

## Step 4 — Script `generateTailoredCv` + `generateCoverLetter`
- [ ] Prompt `src/lib/ai/prompts/generateTailoredCv.ts`
- [ ] Prompt `src/lib/ai/prompts/generateCoverLetter.ts`
- [ ] Script `scripts/test-generate.ts`
- [ ] Iterazione

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
