'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CvTemplate } from '@/components/cv-template/CvTemplate'
import type { TailoredCvData } from '@/lib/ai/_shared/tailoredCvSchema'

interface ResultViewProps {
  generationId: string
  tailoredCv: TailoredCvData
  coverLetter: string
  jobTitle?: string
  company?: string
  createdAt: string
}

export function ResultView({ generationId, tailoredCv, coverLetter, jobTitle, company, createdAt }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'cover'>('cv')

  const date = new Date(createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  const title = [jobTitle, company].filter(Boolean).join(' @ ') || 'Candidatura'

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm transition-colors mb-2 inline-block" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{date}</p>
        </div>

        {/* Download button — disabled until PDF rendering is implemented */}
        <div className="relative group flex-shrink-0">
          <button disabled className="btn-primary !opacity-40 cursor-not-allowed">
            Scarica PDF
          </button>
          <span
            className="absolute top-full right-0 mt-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'rgba(13,13,31,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            In arrivo
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {([['cv', 'CV'], ['cover', 'Cover Letter']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="py-2 px-5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === id ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: activeTab === id ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === id ? '2px solid #7C3AED' : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'cv' ? (
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <CvTemplate data={tailoredCv} />
        </div>
      ) : (
        <div className="glass-card p-8">
          <div
            className="whitespace-pre-wrap leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: '0.95rem' }}
          >
            {coverLetter}
          </div>
        </div>
      )}
    </div>
  )
}
