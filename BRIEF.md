# Project Brief — JobTailor (pre-alpha)

> Prompt iniziale da dare a Claude Code per avviare lo sviluppo del progetto.
> Copia-incolla l'intero contenuto nel primo messaggio a Claude Code quando apri il repo.

---

## Ruolo e obiettivo

Sei il mio partner di sviluppo su un nuovo progetto in fase **pre-alpha**. Lavoreremo insieme in modo iterativo: tu scrivi il codice, io testo e ti do feedback. Prima di scrivere qualsiasi cosa, leggi tutto questo brief e confermami che hai capito facendomi domande sui punti ambigui.

## Cosa stiamo costruendo

Un'applicazione web che, dato il profilo professionale di un utente e una specifica job application, genera un **CV su misura** e una **cover letter personalizzata** per massimizzare il match con quella posizione.

Il valore non è "scrivere un CV da zero con l'AI" — è **adattare in modo intelligente** il materiale che l'utente ha già, riordinando, riformulando e selezionando ciò che è più rilevante per quella specifica opportunità. **L'AI non deve mai inventare esperienze, titoli, aziende o skill che l'utente non ha dichiarato.** Questo è un vincolo non negoziabile.

## Flusso utente

### 1. Onboarding (una tantum) — costruzione del Master Profile

L'utente, al primo accesso, costruisce il suo profilo personale:

- **Upload CV** (PDF o DOCX) → il backend lo manda all'API Anthropic (Claude supporta PDF nativamente) con un prompt di estrazione strutturata che restituisce un JSON con: dati anagrafici, esperienze lavorative, education, skills, lingue, certificazioni, progetti.
- **Form con info aggiuntive libere**: una textarea "raccontami di te" (achievement non nel CV, contesto, motivazioni), campi per preferenze (tono preferito, settori target, disponibilità al remote, etc.), link opzionali (LinkedIn, GitHub, portfolio, sito).
- Il risultato è un **Master Profile** salvato in DB come JSON strutturato + campi di testo libero. L'utente può visualizzarlo ed editarlo manualmente in qualsiasi momento (schermata di profilo).

### 2. Generazione (uso ricorrente)

L'utente arriva nella dashboard e crea una nuova "Application". Può fornire l'input della job in tre modi:

1. **URL** della job posting → il backend fa fetch dell'HTML e lo passa a Claude per estrazione strutturata (titolo, azienda, requirements, responsibilities, nice-to-have, tone, lingua).
2. **Testo** incollato direttamente → stesso parsing strutturato.
3. **Form minimo**: azienda + ruolo + descrizione breve (fallback).

Poi clicca "Genera" e il sistema:

1. Passa Master Profile + Job Description strutturata a Claude con un prompt di generazione.
2. Riceve CV tailored (strutturato in sezioni) + cover letter.
3. Renderizza il CV in un template pulito e ATS-friendly e lo converte in PDF.
4. Mostra preview di entrambi, permette modifiche inline, e offre il download PDF.
5. Salva la generazione nello storico dell'utente, collegata al Master Profile e alla Job.

### 3. Storico

L'utente vede tutte le sue generazioni passate, può riaprirle, duplicarle, rigenerarle con feedback ("rendi il tono più formale", "enfatizza di più l'esperienza X").

## Stack tecnico

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: Next.js API routes (monolite, poi si spacca se serve)
- **Auth**: Supabase Auth (email magic link + Google OAuth)
- **DB**: Supabase (Postgres) con le tabelle: `users`, `master_profiles`, `jobs`, `generations`
- **AI**: API Anthropic ufficiale, modello `claude-sonnet-4-5` (ottimo rapporto qualità/costo per parsing + generazione). Usa l'SDK ufficiale `@anthropic-ai/sdk`.
- **PDF parsing in ingresso**: input diretto a Claude come document block (niente librerie terze).
- **PDF generation in uscita**: genera HTML con un template React, poi converti con `puppeteer` (o `@react-pdf/renderer` se preferisci — decidi tu e motivami la scelta).
- **Web scraping** per URL job: `fetch` + pulizia HTML con `cheerio`, poi passi il testo a Claude per estrazione strutturata. Non preoccuparti di LinkedIn (richiede login), metti un messaggio chiaro se il dominio è linkedin.com.
- **Deployment target**: Vercel (frontend) + Supabase (DB/auth). La pre-alpha gira in locale, ma struttura tutto perché sia deployabile su Vercel senza refactoring.

## Struttura del repo

Setup iniziale pulito: monorepo semplice con Next.js, niente complicazioni. Usa `pnpm`. Configurazione ESLint + Prettier + TypeScript strict. Commit con conventional commits.

## Prompt engineering — il cuore del progetto

Crea una cartella `src/lib/ai/prompts/` con file separati per ogni prompt, versionati:

1. `extractCvFromPdf.ts` — estrae il Master Profile strutturato dal PDF del CV.
2. `extractJobFromText.ts` — estrae la Job Description strutturata da testo libero o HTML pulito.
3. `generateTailoredCv.ts` — il prompt principale: prende Master Profile + Job strutturata → restituisce CV tailored in JSON strutturato (sezioni, bullet point riformulati, skill ordinate per rilevanza).
4. `generateCoverLetter.ts` — genera la cover letter nella lingua della job, con riferimenti specifici all'azienda e al ruolo.

Per ciascun prompt:
- System prompt chiaro con ruolo, vincoli, formato di output (JSON schema esplicito).
- **Vincolo anti-hallucination esplicito**: "Usa solo informazioni presenti nel Master Profile. Se una skill o esperienza richiesta dalla job non è presente, NON inventarla. Puoi riformulare, riordinare, enfatizzare, tradurre, ma mai aggiungere fatti nuovi."
- Istruzione sulla lingua: output nella lingua della job description, non dell'utente.
- Istruzione sul tono: adatta al contesto dell'azienda (startup vs corporate vs pubblica amministrazione).
- Usa structured output (tool use o JSON mode) per garantire parsing affidabile.

## Modello dati (prima bozza)

```sql
users (id, email, created_at)

master_profiles (
  id, user_id, 
  structured_data jsonb,  -- il JSON parsato dal CV + info extra
  raw_cv_url,             -- PDF originale su Supabase Storage
  free_text,              -- "raccontami di te"
  preferences jsonb,      -- tono, settori, lingue
  updated_at
)

jobs (
  id, user_id,
  source_type,            -- 'url' | 'text' | 'form'
  source_value,           -- l'URL o il testo originale
  structured_data jsonb,  -- parsing strutturato
  created_at
)

generations (
  id, user_id, master_profile_id, job_id,
  tailored_cv jsonb,      -- CV strutturato generato
  cover_letter text,
  cv_pdf_url,             -- PDF generato su Supabase Storage
  feedback text,          -- eventuali istruzioni di rigenerazione
  created_at
)
```

## Template CV

Per la pre-alpha, UN solo template: pulito, sobrio, ATS-friendly, una colonna, font sans-serif, nessun elemento grafico pesante. Stile "Harvard modernizzato". Lo costruiamo come componente React che accetta il JSON del CV tailored e lo renderizza. Poi Puppeteer lo screenshotta in PDF.

## Roadmap di sviluppo (ordine suggerito)

Lavoriamo **bottom-up sull'AI prima**, poi avvolgiamo in UI. Questo è l'ordine in cui voglio procedere:

1. **Setup repo**: Next.js + TS + Tailwind + shadcn + Supabase + env vars per Anthropic API key.
2. **Script standalone** (`scripts/test-extract-cv.ts`) che prende un PDF di esempio dalla cartella `/fixtures` e testa l'estrazione del Master Profile. Iteriamo sul prompt finché l'output è solido.
3. **Script standalone** per estrazione Job da testo. Stessa cosa.
4. **Script standalone** per generazione CV tailored + cover letter. Iteriamo.
5. **Solo quando i tre script producono output di qualità**, costruiamo l'UI: auth → onboarding → dashboard → generazione → preview → download.
6. **PDF rendering** come ultimo step prima del testing.
7. **Storico e rigenerazione con feedback** come polish finale.

## Come voglio lavorare con te

- **Piccoli passi**: fai una cosa per volta, poi fermati e fammi testare. Non generare 20 file in un colpo solo.
- **Spiegami le decisioni**: quando scegli tra due approcci, dimmi perché.
- **Chiedi quando non sei sicuro**: meglio una domanda in più che un refactoring dopo.
- **Commit frequenti** con messaggi chiari.
- **TODO esplicito**: tieni aggiornato un file `TODO.md` alla radice con lo stato di ogni step della roadmap.

## Primo task

Dopo aver letto questo brief:

1. Fammi un riassunto di quello che hai capito, in massimo 10 righe.
2. Elenca i dubbi o le decisioni aperte su cui vuoi allineamento prima di scrivere codice.
3. Proponimi lo **step 1** (setup repo) con l'elenco esatto dei comandi e dei file che creerai, ma **non eseguire nulla finché non ti do l'ok**.

Andiamo.
