'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'upload' | 'complete-profile' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Carica CV' },
  { id: 'complete-profile', label: 'Completa profilo' },
  { id: 'done', label: 'Pronto' },
]

const TONE_OPTIONS = [
  { value: 'neutral', label: 'Neutro' },
  { value: 'formal', label: 'Formale' },
  { value: 'conversational', label: 'Conversazionale' },
  { value: 'startup', label: 'Startup' },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedSummary, setExtractedSummary] = useState<{ name: string; experienceCount: number; skillsCount: number } | null>(null)
  const [freeText, setFreeText] = useState('')
  const [tone, setTone] = useState('neutral')
  const [sectors, setSectors] = useState<string[]>([])
  const [sectorInput, setSectorInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const currentStepIndex = STEPS.findIndex((s) => s.id === step)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') { setFile(f); setError(null) }
    else setError('Seleziona un file PDF valido')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type === 'application/pdf') { setFile(f); setError(null) }
    else setError('Seleziona un file PDF valido')
  }

  async function handleExtract() {
    if (!file) return
    setLoading(true); setError(null)

    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    const res = await fetch('/api/cv/extract', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pdf_base64: base64 }),
    })

    setLoading(false)
    if (!res.ok) { setError('Errore durante l\'estrazione. Riprova.'); return }

    const profile = await res.json()
    const sd = profile.structured_data
    setExtractedSummary({
      name: sd?.personal?.name ?? 'Profilo',
      experienceCount: sd?.experience?.length ?? 0,
      skillsCount: sd?.skills?.reduce((acc: number, g: { items: string[] }) => acc + g.items.length, 0) ?? 0,
    })
    setStep('complete-profile')
  }

  function handleAddSector(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && sectorInput.trim()) {
      e.preventDefault()
      setSectors((prev) => [...prev, sectorInput.trim()])
      setSectorInput('')
    }
  }

  async function handleSaveProfile() {
    setLoading(true); setError(null)

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ free_text: freeText, preferences: { tone, target_sectors: sectors } }),
    })

    setLoading(false)
    if (!res.ok) { setError('Errore durante il salvataggio. Riprova.'); return }
    setStep('done')
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: i < currentStepIndex ? '#06B6D4' : i === currentStepIndex ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === currentStepIndex ? '0 0 12px rgba(124,58,237,0.6)' : 'none',
                  color: i <= currentStepIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <span className="mono-badge mt-2 !text-[10px] !py-0.5 !px-2">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-16 h-px mx-2 mb-6" style={{ background: i < currentStepIndex ? '#06B6D4' : 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Carica il tuo CV</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
            Supportiamo PDF. Claude estrarrà automaticamente tutti i tuoi dati.
          </p>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors"
            style={{ borderColor: file ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.15)' }}
          >
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            {file ? (
              <div>
                <p className="text-2xl mb-2">📄</p>
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {(file.size / 1024).toFixed(0)} KB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="text-xs mt-2 text-red-400 hover:text-red-300"
                >
                  Rimuovi
                </button>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-3">📤</p>
                <p className="text-white font-medium">Trascina il PDF qui</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  o clicca per selezionare
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleExtract}
            disabled={!file || loading}
            className="btn-primary w-full"
          >
            {loading ? 'Estrazione in corso...' : 'Estrai profilo →'}
          </button>
        </div>
      )}

      {/* Step 2: Complete profile */}
      {step === 'complete-profile' && (
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Completa il profilo</h2>

          {extractedSummary && (
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <p className="font-semibold text-white">{extractedSummary.name}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {extractedSummary.experienceCount} esperienze · {extractedSummary.skillsCount} skill estratte
                </p>
              </div>
              <span className="mono-badge ml-auto">estratto da claude</span>
            </div>
          )}

          <div>
            <label className="block text-sm mb-2 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Raccontami di te
            </label>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Achievement non nel CV, motivazioni, contesto lavorativo che vuoi che Claude conosca..."
              className="input-field min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Tono preferito
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input-field"
            >
              {TONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: '#0d0d1f' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Settori target
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="mono-badge cursor-pointer"
                  onClick={() => setSectors(sectors.filter((x) => x !== s))}
                >
                  {s} ×
                </span>
              ))}
            </div>
            <input
              type="text"
              value={sectorInput}
              onChange={(e) => setSectorInput(e.target.value)}
              onKeyDown={handleAddSector}
              placeholder="Aggiungi settore (premi Invio)"
              className="input-field"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button onClick={handleSaveProfile} disabled={loading} className="btn-primary w-full">
            {loading ? 'Salvataggio...' : 'Salva profilo →'}
          </button>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && (
        <div className="glass-card p-8 text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
            style={{ background: 'rgba(6,182,212,0.15)', boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}
          >
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Profilo salvato</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Ora puoi creare la tua prima candidatura.
            </p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Vai alla dashboard →
          </button>
        </div>
      )}
    </div>
  )
}
