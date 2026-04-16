/**
 * Generates fixtures/CV Resume.pdf — a realistic sample CV for testing extractCvFromPdf.
 * Run once: tsx scripts/create-fixture-cv.ts
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

async function main() {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)

  let y = height - 50
  const left = 50
  const lineHeight = 16
  const sectionGap = 10

  function text(str: string, x: number, yPos: number, size = 10, font = regular) {
    page.drawText(str, { x, y: yPos, size, font, color: rgb(0, 0, 0) })
  }

  function line(yPos: number) {
    page.drawLine({
      start: { x: left, y: yPos },
      end: { x: width - left, y: yPos },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })
  }

  function section(title: string) {
    y -= sectionGap
    text(title.toUpperCase(), left, y, 9, bold)
    y -= 4
    line(y)
    y -= lineHeight
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  text('Marco Bianchi', left, y, 20, bold)
  y -= 22
  text('Senior Frontend Engineer', left, y, 12, regular)
  y -= lineHeight
  text('marco.bianchi@email.com  •  +39 333 123 4567  •  Milano, Italia', left, y, 9)
  y -= 10
  text('linkedin.com/in/marcobianchi  •  github.com/marcobianchi', left, y, 9)
  y -= lineHeight * 2

  // ── Summary ─────────────────────────────────────────────────────────────────
  section('Profilo')
  text('Frontend engineer con 6 anni di esperienza nella costruzione di applicazioni React scalabili.', left, y, 9)
  y -= lineHeight
  text('Specializzato in TypeScript, performance optimization e design system. Appassionato di UX.', left, y, 9)
  y -= lineHeight * 1.5

  // ── Experience ──────────────────────────────────────────────────────────────
  section('Esperienza Lavorativa')

  text('TechCorp Italia — Senior Frontend Engineer', left, y, 10, bold)
  y -= lineHeight
  text('Mar 2022 – Presente  |  Milano (Ibrido)', left, y, 9)
  y -= lineHeight
  text('• Architettato e sviluppato la nuova dashboard B2B con React 18 e TypeScript', left + 5, y, 9)
  y -= lineHeight
  text('• Ridotto il bundle size del 42% introducendo code splitting e lazy loading', left + 5, y, 9)
  y -= lineHeight
  text('• Guidato la migrazione da JavaScript a TypeScript per un codebase da 80.000 righe', left + 5, y, 9)
  y -= lineHeight
  text('• Mentoring di 3 sviluppatori junior; introdotto code review sistematico', left + 5, y, 9)
  y -= lineHeight
  text('• Collaborato con il team di design per costruire un design system con 40+ componenti', left + 5, y, 9)
  y -= lineHeight * 1.5

  text('StartupXYZ — Frontend Developer', left, y, 10, bold)
  y -= lineHeight
  text('Giu 2020 – Feb 2022  |  Remoto', left, y, 9)
  y -= lineHeight
  text('• Sviluppato da zero il prodotto principale con React, Redux e Styled Components', left + 5, y, 9)
  y -= lineHeight
  text('• Integrato 15+ API REST e WebSocket per features real-time', left + 5, y, 9)
  y -= lineHeight
  text('• Implementato testing con Jest e React Testing Library (coverage 78%)', left + 5, y, 9)
  y -= lineHeight * 1.5

  text('Agenzia Web Rossi & Co — Junior Web Developer', left, y, 10, bold)
  y -= lineHeight
  text('Set 2018 – Mag 2020  |  Milano', left, y, 9)
  y -= lineHeight
  text('• Realizzato 20+ siti web per clienti PMI con React e WordPress', left + 5, y, 9)
  y -= lineHeight
  text('• Ottimizzato le performance SEO e Core Web Vitals per 5 progetti e-commerce', left + 5, y, 9)
  y -= lineHeight * 1.5

  // ── Education ───────────────────────────────────────────────────────────────
  section('Formazione')
  text('Politecnico di Milano — Laurea Triennale Informatica', left, y, 10, bold)
  y -= lineHeight
  text('2015 – 2018  |  Voto: 105/110', left, y, 9)
  y -= lineHeight * 1.5

  // ── Skills ──────────────────────────────────────────────────────────────────
  section('Competenze Tecniche')
  text('Framework & Librerie:  React, Next.js, Vue.js, Redux, Zustand, React Query', left, y, 9)
  y -= lineHeight
  text('Linguaggi:  TypeScript, JavaScript (ES2022+), HTML5, CSS3', left, y, 9)
  y -= lineHeight
  text('Styling:  Tailwind CSS, CSS Modules, Styled Components, Sass', left, y, 9)
  y -= lineHeight
  text('Testing:  Vitest, Jest, React Testing Library, Cypress, Playwright', left, y, 9)
  y -= lineHeight
  text('Tools:  Git, GitHub Actions, Webpack, Vite, Docker, Figma', left, y, 9)
  y -= lineHeight * 1.5

  // ── Languages ───────────────────────────────────────────────────────────────
  section('Lingue')
  text('Italiano — Madrelingua   |   Inglese — Professionale (C1)   |   Spagnolo — Base (A2)', left, y, 9)
  y -= lineHeight * 1.5

  // ── Certifications ──────────────────────────────────────────────────────────
  section('Certificazioni')
  text('AWS Certified Developer – Associate  (Amazon Web Services, 2023)', left, y, 9)
  y -= lineHeight
  text('Google Professional Data Engineer  (Google Cloud, 2022)', left, y, 9)
  y -= lineHeight * 1.5

  // ── Projects ────────────────────────────────────────────────────────────────
  section('Progetti Open Source')
  text('react-perf-kit — Libreria React per performance monitoring, 1.200+ star su GitHub', left, y, 9)
  y -= lineHeight
  text('  Tecnologie: React, TypeScript, Rollup  |  github.com/marcobianchi/react-perf-kit', left + 5, y, 9)

  const pdfBytes = await doc.save()
  const outPath = resolve(process.cwd(), 'fixtures/CV Resume.pdf')
  writeFileSync(outPath, pdfBytes)
  console.log(`PDF created: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
