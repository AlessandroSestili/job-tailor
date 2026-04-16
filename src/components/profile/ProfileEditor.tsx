'use client'

import { useState } from 'react'
import type { MasterProfileRow } from '@/lib/db/types'

interface ProfileEditorProps {
  initialProfile: MasterProfileRow | null
}

const TONE_OPTIONS = [
  { value: 'neutral', label: 'Neutro' },
  { value: 'formal', label: 'Formale' },
  { value: 'conversational', label: 'Conversazionale' },
  { value: 'startup', label: 'Startup' },
]

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [freeText, setFreeText] = useState(initialProfile?.free_text ?? '')
  const [tone, setTone] = useState<string>(initialProfile?.preferences?.tone ?? 'neutral')
  const [sectors, setSectors] = useState<string[]>(initialProfile?.preferences?.target_sectors ?? [])
  const [sectorInput, setSectorInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sd = initialProfile?.structured_data
  const profile = sd

  function handleAddSector(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && sectorInput.trim()) {
      e.preventDefault()
      setSectors((prev) => [...prev, sectorInput.trim()])
      setSectorInput('')
    }
  }

  async function handleSave() {
    setSaving(true); setError(null); setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ free_text: freeText, preferences: { tone, target_sectors: sectors } }),
    })
    setSaving(false)
    if (!res.ok) { setError('Errore durante il salvataggio.'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div>
        <span className="mono-badge mb-4 inline-block">profilo</span>
        <h1 className="text-3xl font-bold text-white">Il tuo Master Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Questi dati vengono usati da Claude per generare ogni candidatura.
        </p>
      </div>

      {/* Extracted data summary */}
      {profile && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            Dati estratti dal CV
            <span className="mono-badge">estratto da claude</span>
          </h2>

          {/* Personal */}
          {profile.personal && (
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains)' }}>Dati personali</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(profile.personal).map(([k, v]) =>
                  v ? (
                    <div key={k} style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{k}: </span>{String(v)}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Experience count */}
          {profile.experience && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {profile.experience.length} esperienze · {profile.skills?.reduce((a: number, g: { items: string[] }) => a + g.items.length, 0)} skill
            </p>
          )}
        </div>
      )}

      {/* Editable fields */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="font-semibold text-white">Informazioni aggiuntive</h2>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Raccontami di te
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Achievement non nel CV, motivazioni, contesto..."
            className="input-field resize-none"
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Tono preferito
          </label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
            {TONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: '#0d0d1f' }}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Settori target
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {sectors.map((s) => (
              <span key={s} className="mono-badge cursor-pointer" onClick={() => setSectors(sectors.filter((x) => x !== s))}>
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

        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Salvataggio...' : saved ? '✓ Salvato' : 'Salva modifiche'}
        </button>
      </div>
    </div>
  )
}
