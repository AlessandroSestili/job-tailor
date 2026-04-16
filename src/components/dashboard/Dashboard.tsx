'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Generation {
  id: string
  created_at: string
  tailored_cv: { personal?: { name?: string }; summary?: string }
  jobs?: { structured_data?: { title?: string; company?: string } }
}

interface DashboardProps {
  userName?: string
}

export function Dashboard({ userName }: DashboardProps) {
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/generations')
      .then((r) => r.json())
      .then((data) => { setGenerations(Array.isArray(data) ? data.slice(0, 5) : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const greeting = userName ? `Ciao, ${userName.split(' ')[0]}.` : 'Bentornato.'

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Greeting */}
      <h1 className="text-3xl font-bold text-white">{greeting}</h1>

      {/* New application CTA */}
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
            Incolla un'offerta di lavoro e genera CV + cover letter in 30 secondi.
          </p>
        </div>
        <button onClick={() => router.push('/generate')} className="btn-primary flex-shrink-0">
          Inizia →
        </button>
      </div>

      {/* Recent generations */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono-badge">storico</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-3 rounded w-1/4 mt-2" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
            ))}
          </div>
        ) : generations.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Nessuna candidatura ancora.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((g) => {
              const job = g.jobs?.structured_data
              const title = job?.title ?? 'Posizione sconosciuta'
              const company = job?.company ?? ''
              const date = new Date(g.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

              return (
                <div key={g.id} className="glass-card glass-card-hover p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{title} {company && <span style={{ color: 'rgba(255,255,255,0.4)' }}>@ {company}</span>}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{date}</p>
                  </div>
                  <Link href={`/result/${g.id}`} className="btn-secondary !py-2 !px-4 text-sm">
                    Riapri
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
