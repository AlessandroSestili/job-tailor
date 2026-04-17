'use client'

/**
 * /x-preview — UI preview route. No auth, no Supabase.
 * Shows all screens with mock data for visual QA.
 */

import { useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { Navbar } from '@/components/layout/Navbar'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { GenerateForm } from '@/components/generate/GenerateForm'
import { GenerationStepper } from '@/components/generate/GenerationStepper'
import { ResultView } from '@/components/result/ResultView'
import type { TailoredCvData } from '@/lib/ai/_shared/tailoredCvSchema'
import type { MasterProfileRow } from '@/lib/db/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CV: TailoredCvData = {
  personal: {
    name: 'Alessandro Sestili',
    email: 'alessandrosestili@gmail.com',
    phone: '+39 333 123 4567',
    location: 'Milano, IT',
    linkedin: 'linkedin.com/in/alessandrosestili',
    github: 'github.com/AlessandroSestili',
  },
  summary:
    'Frontend engineer con 4 anni di esperienza in React e TypeScript, appassionato di design system e performance. Cerco un ruolo in un team che costruisce prodotti ad alto impatto con cura per i dettagli.',
  experience: [
    {
      company: 'Startup X',
      title: 'Senior Frontend Engineer',
      start_date: 'Gen 2022',
      current: true,
      achievements: [
        'Ridotto il bundle size del 40% con code splitting strategico',
        'Costruito il design system aziendale da zero (30+ componenti)',
        'Introdotto Vitest + Testing Library, portando coverage da 0% a 72%',
      ],
    },
    {
      company: 'Agenzia Y',
      title: 'Frontend Developer',
      start_date: 'Mar 2020',
      end_date: 'Dic 2021',
      current: false as const,
      achievements: [
        'Sviluppato 8 landing page ad alta conversione in Next.js',
        'Integrato Stripe per pagamenti in 3 prodotti SaaS',
      ],
    },
  ],
  education: [
    {
      institution: 'Politecnico di Milano',
      degree: 'Laurea Magistrale',
      field: 'Ingegneria Informatica',
      end_date: '2020',
      grade: '110/110 con lode',
    },
  ],
  skills: [
    { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
    { category: 'Backend', items: ['Node.js', 'Supabase', 'PostgreSQL', 'REST API'] },
    { category: 'Tooling', items: ['Vitest', 'Playwright', 'Webpack', 'Turbopack'] },
  ],
  languages: [
    { language: 'Italiano', level: 'Madrelingua' },
    { language: 'Inglese', level: 'C1' },
  ],
  certifications: [],
  projects: [
    {
      name: 'JobTailor',
      description: 'Generatore AI di CV e cover letter personalizzati. Stack: Next.js 16, Supabase, Claude.',
      technologies: ['Next.js', 'TypeScript', 'Anthropic SDK'],
    },
  ],
}

const MOCK_COVER_LETTER = `Gentile Team di Acme Corp,

Vi scrivo per candidarmi alla posizione di Senior Frontend Engineer. Ho seguito con interesse la crescita di Acme negli ultimi anni e il vostro approccio al prodotto rispecchia esattamente i valori che cerco in un team.

Negli ultimi 4 anni ho costruito interfacce complesse per prodotti SaaS, con un focus particolare su performance, accessibilità e design system scalabili. Il mio contributo più significativo è stato ridurre il bundle size del 40% in Startup X, con impatto diretto sul conversion rate.

Sono convinto che le mie competenze in React, TypeScript e Next.js, unite alla mia attenzione per i dettagli, possano portare valore concreto al vostro team.

Sarei felice di approfondire in una call.

Cordiali saluti,
Alessandro Sestili`

const MOCK_PROFILE: MasterProfileRow = {
  id: 'mock-profile-id',
  user_id: 'mock-user-id',
  structured_data: {
    personal: { name: 'Alessandro Sestili', email: 'alessandrosestili@gmail.com', phone: '+39 333 123 4567', location: 'Milano, IT' },
    experience: [
      { company: 'Startup X', title: 'Senior Frontend Engineer', start_date: 'Gen 2022', current: true, achievements: [] },
    ],
    education: [],
    skills: [
      { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript'] },
    ],
    languages: [{ language: 'Italiano', level: 'Madrelingua' }],
    certifications: [],
    projects: [],
  },
  raw_cv_url: null,
  free_text: 'Portfolio: alessandrosestili.com — mi piace costruire cose belle e veloci.',
  preferences: { tone: 'startup', target_sectors: ['SaaS', 'AI', 'Fintech'] },
  updated_at: new Date().toISOString(),
}

// ─── Screens ──────────────────────────────────────────────────────────────────

const SCREENS = [
  'Login',
  'Onboarding',
  'Dashboard',
  'Generate — Form',
  'Generate — Stepper',
  'Result',
  'Profile',
] as const

type Screen = (typeof SCREENS)[number]

// ─── Preview shell ────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const [active, setActive] = useState<Screen>('Login')
  const [stepperStep, setStepperStep] = useState<0 | 1 | 2>(0)

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      {/* Preview toolbar */}
      <div
        className="sticky top-0 z-50 px-4 py-2 flex items-center gap-2 overflow-x-auto"
        style={{ background: 'rgba(13,13,31,0.95)', borderBottom: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(12px)' }}
      >
        <span className="mono-badge mr-2 flex-shrink-0">x-preview</span>
        {SCREENS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: active === s ? 'rgba(124,58,237,0.25)' : 'transparent',
              color: active === s ? '#a78bfa' : 'rgba(255,255,255,0.45)',
              border: active === s ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Screen content */}
      <div className="relative">
        {active === 'Login' && (
          <main className="min-h-screen flex items-center justify-center p-6 dot-grid relative overflow-hidden">
            <div className="orb-violet w-96 h-96 -top-20 -left-20 opacity-60" />
            <div className="orb-cyan w-80 h-80 -bottom-10 -right-10 opacity-40" />
            <AuthForm />
          </main>
        )}

        {active === 'Onboarding' && (
          <main className="min-h-screen p-6 pt-16 dot-grid relative overflow-hidden">
            <div className="orb-violet w-96 h-96 top-0 right-0 opacity-40" />
            <div className="orb-cyan w-64 h-64 bottom-0 left-0 opacity-30" />
            <div className="max-w-xl mx-auto relative z-10">
              <div className="text-center mb-10">
                <span className="mono-badge mb-4 inline-block">onboarding</span>
                <h1 className="text-3xl font-black text-white">
                  Costruiamo il tuo <span className="text-gradient">Master Profile</span>
                </h1>
              </div>
              <OnboardingMockWizard />
            </div>
          </main>
        )}

        {active === 'Dashboard' && (
          <>
            <Navbar userEmail="alessandrosestili@gmail.com" />
            <MockDashboard />
          </>
        )}

        {active === 'Generate — Form' && (
          <>
            <Navbar userEmail="alessandrosestili@gmail.com" />
            <main className="max-w-2xl mx-auto px-6 py-12">
              <div className="mb-8">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>← Dashboard</p>
                <h1 className="text-3xl font-bold text-white mt-3">Nuova candidatura</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Incolla l&apos;offerta di lavoro e lascia fare il resto a Claude.
                </p>
              </div>
              <GenerateForm />
            </main>
          </>
        )}

        {active === 'Generate — Stepper' && (
          <>
            <Navbar userEmail="alessandrosestili@gmail.com" />
            <main className="max-w-2xl mx-auto px-6 py-12">
              <div className="glass-card p-8">
                <GenerationStepper currentStep={stepperStep} />
                <div className="flex gap-2 justify-center mt-4">
                  {([0, 1, 2] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStepperStep(s)}
                      className="px-4 py-1.5 rounded-lg text-xs font-mono transition-all"
                      style={{
                        background: stepperStep === s ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                        color: stepperStep === s ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      step {s}
                    </button>
                  ))}
                </div>
              </div>
            </main>
          </>
        )}

        {active === 'Result' && (
          <>
            <Navbar userEmail="alessandrosestili@gmail.com" />
            <ResultView
              generationId="mock-id"
              tailoredCv={MOCK_CV}
              coverLetter={MOCK_COVER_LETTER}
              jobTitle="Senior Frontend Engineer"
              company="Acme Corp"
              createdAt={new Date().toISOString()}
            />
          </>
        )}

        {active === 'Profile' && (
          <>
            <Navbar userEmail="alessandrosestili@gmail.com" />
            <ProfileEditor initialProfile={MOCK_PROFILE} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Inline mock sub-components ───────────────────────────────────────────────

function OnboardingMockWizard() {
  const [step, setStep] = useState(0)

  const steps = [
    { label: 'Carica il CV', icon: '📄' },
    { label: 'Completa il profilo', icon: '✏️' },
    { label: 'Tutto pronto!', icon: '🚀' },
  ]

  return (
    <div className="glass-card p-8 space-y-8">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {steps.map((_s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => setStep(i)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0"
              style={{
                background: i === step ? '#7C3AED' : i < step ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                boxShadow: i === step ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
              }}
            >
              {i < step ? '✓' : i + 1}
            </button>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2" style={{ background: i < step ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.05)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center gap-4">
        <span className="text-5xl">{steps[step].icon}</span>
        <h2 className="text-xl font-bold text-white">{steps[step].label}</h2>
        {step === 0 && (
          <div
            className="w-full border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all"
            style={{ borderColor: 'rgba(124,58,237,0.3)', color: 'rgba(255,255,255,0.3)' }}
          >
            <p className="text-sm">Trascina qui il tuo CV in PDF</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>oppure clicca per selezionare</p>
          </div>
        )}
        {step === 1 && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Aggiungi informazioni aggiuntive e preferenze di tone of voice.
          </p>
        )}
        {step === 2 && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Il tuo Master Profile è pronto. Genera la tua prima candidatura.
          </p>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
            Indietro
          </button>
        )}
        <button
          onClick={() => setStep(Math.min(step + 1, steps.length - 1))}
          className="btn-primary flex-1"
        >
          {step === steps.length - 1 ? 'Vai alla dashboard →' : 'Continua →'}
        </button>
      </div>
    </div>
  )
}

function MockDashboard() {
  const MOCK_GENERATIONS = [
    { id: '1', title: 'Senior Frontend Engineer', company: 'Acme Corp', date: '15 apr 2026' },
    { id: '2', title: 'Product Designer', company: 'Beta Inc', date: '12 apr 2026' },
    { id: '3', title: 'Full Stack Developer', company: 'Gamma Ltd', date: '10 apr 2026' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold text-white">Ciao, Alessandro.</h1>

      <div className="glass-card glass-card-hover p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(124,58,237,0.15)', boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}
        >
          ✨
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-1">Nuova candidatura</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
            Incolla un&apos;offerta di lavoro e genera CV + cover letter in 30 secondi.
          </p>
        </div>
        <button className="btn-primary flex-shrink-0">Inizia →</button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono-badge">storico</span>
        </div>
        <div className="space-y-3">
          {MOCK_GENERATIONS.map((g) => (
            <div key={g.id} className="glass-card glass-card-hover p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  {g.title} <span style={{ color: 'rgba(255,255,255,0.4)' }}>@ {g.company}</span>
                </p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{g.date}</p>
              </div>
              <button className="btn-secondary !py-2 !px-4 text-sm">Riapri</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
