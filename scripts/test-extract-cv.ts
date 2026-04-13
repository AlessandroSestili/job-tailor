import { readFileSync } from 'fs'
import { resolve } from 'path'
import { extractCvFromPdf } from '../src/lib/ai/prompts/extractCvFromPdf'

async function main() {
  const pdfPath = resolve(process.cwd(), 'fixtures/CV Resume.pdf')
  console.log(`Reading PDF: ${pdfPath}`)

  const pdfBuffer = readFileSync(pdfPath)
  const pdfBase64 = pdfBuffer.toString('base64')

  console.log('Sending to Claude for extraction...\n')
  const result = await extractCvFromPdf(pdfBase64)

  console.log('=== EXTRACTED MASTER PROFILE ===\n')
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
