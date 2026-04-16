'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GenerationStepper } from './GenerationStepper'

type TabId = 'text' | 'url' | 'manual'

const TABS: { id: TabId; label: string }[] = [
  { id: 'text', label: 'Testo' },
  { id: 'url', label: 'URL' },
  { id: 'manual', label: 'Manuale' },
]

export function GenerateForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatorStep, setGeneratorStep] = useState<0 | 1 | 2>(0)
  const [error, setError] = useState<string | null>(null)

  function getSourceValue(): { source_type: string; source_value: string } | null {
    if (activeTab === 'text' && text.trim()) return { source_type: 'text', source_value: text }
    if (activeTab === 'url' && url.trim()) return { source_type: 'url', source_value: url }
    if (activeTab === 'manual' && company && role) {
      return { source_type: 'text', source_value: `Azienda: ${company}\nRuolo: ${role}\n${description}` }
    }
    return null
  }

  const isValid = Boolean(getSourceValue())

  async function handleGenerate() {
    const source = getSourceValue()
    if (!source) return

    setGenerating(true); setError(null); setGeneratorStep(0)

    // Simulate step progression
    const stepTimer1 = setTimeout(() => setGeneratorStep(1), 8000)
    const stepTimer2 = setTimeout(() => setGeneratorStep(2), 18000)

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(source),
    })

    clearTimeout(stepTimer1); clearTimeout(stepTimer2)

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Errore durante la generazione. Riprova.')
      setGenerating(false)
      return
    }

    const { generation_id } = await res.json()
    router.push(`/result/${generation_id}`)
  }

  if (generating) {
    return (
      <div className="glass-card p-8">
        <GenerationStepper currentStep={generatorStep} />
        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <button onClick={() => { setGenerating(false); setError(null) }} className="btn-secondary">
              Riprova
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === tab.id ? '2px solid #7C3AED' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'text' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Testo dell'offerta
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Incolla qui il testo dell'offerta di lavoro..."
              className="input-field resize-none"
              rows={8}
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              URL dell'offerta
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              ⚠️ LinkedIn non è supportato — incolla il testo direttamente.
            </p>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Azienda *
              </label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Ruolo *
              </label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Frontend Engineer" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Descrizione breve
              </label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Requisiti, responsabilità..." className="input-field resize-none" rows={4} />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={!isValid}
        className="btn-primary w-full"
      >
        Genera CV e Cover Letter →
      </button>
    </div>
  )
}
