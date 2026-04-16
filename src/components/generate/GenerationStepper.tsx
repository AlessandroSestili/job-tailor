'use client'

import { useEffect, useState } from 'react'

interface Step {
  label: string
  icon: string
  color: string
  messages: string[]
}

const STEPS: Step[] = [
  {
    label: 'Analizzo l\'offerta di lavoro...',
    icon: '🔍',
    color: '#7C3AED',
    messages: [
      'Identifico i requisiti chiave...',
      'Analizzo il tono aziendale...',
      'Estraggo le competenze richieste...',
    ],
  },
  {
    label: 'Costruisco il tuo CV su misura...',
    icon: '📝',
    color: '#06B6D4',
    messages: [
      'Riordino le esperienze per massimizzare il match...',
      'Seleziono le skill più rilevanti...',
      'Riformulo i bullet point con le keyword del ruolo...',
      'Scrivo il sommario personalizzato...',
    ],
  },
  {
    label: 'Scrivo la cover letter...',
    icon: '✍️',
    color: '#F59E0B',
    messages: [
      'Studio il contesto aziendale...',
      'Collego i tuoi achievement ai requisiti...',
      'Adatto il tono alla cultura dell\'azienda...',
    ],
  },
]

interface GenerationStepperProps {
  currentStep: 0 | 1 | 2
}

export function GenerationStepper({ currentStep }: GenerationStepperProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const messages = STEPS[currentStep]?.messages ?? []
    setMessageIndex(0)
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [currentStep])

  const currentMessage = STEPS[currentStep]?.messages[messageIndex] ?? ''
  const progress = ((currentStep + 0.5) / STEPS.length) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 relative">
      {/* Orbs */}
      <div className="orb-violet w-64 h-64 -top-10 -left-10 opacity-50" style={{ position: 'absolute' }} />
      <div className="orb-cyan w-48 h-48 -bottom-10 -right-10 opacity-30" style={{ position: 'absolute' }} />

      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        <span className="mono-badge">~30 secondi</span>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: i === currentStep ? `rgba(${s.color === '#7C3AED' ? '124,58,237' : s.color === '#06B6D4' ? '6,182,212' : '245,158,11'},0.1)` : 'transparent',
                border: i === currentStep ? `1px solid ${s.color}40` : '1px solid transparent',
              }}
            >
              <span
                className="text-2xl transition-all"
                style={{
                  filter: i < currentStep ? 'grayscale(0)' : i === currentStep ? `drop-shadow(0 0 8px ${s.color})` : 'grayscale(1) opacity(0.3)',
                }}
              >
                {i < currentStep ? '✅' : s.icon}
              </span>
              <div className="flex-1 text-left">
                <p
                  className="font-medium transition-colors"
                  style={{ color: i === currentStep ? '#fff' : i < currentStep ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
                >
                  {s.label}
                </p>
                {i === currentStep && (
                  <p className="text-sm mt-0.5 transition-opacity" style={{ color: s.color }}>
                    {currentMessage}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
              boxShadow: '0 0 10px rgba(124,58,237,0.5)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
