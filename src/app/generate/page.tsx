export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { GenerateForm } from '@/components/generate/GenerateForm'

export default async function GeneratePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <>
      <Navbar userEmail={session.user.email} />
      <main className="max-w-2xl mx-auto px-6 py-12 relative">
        <div className="orb-violet w-64 h-64 -top-10 -right-10 opacity-30" style={{ position: 'fixed', pointerEvents: 'none' }} />

        <div className="mb-8">
          <Link href="/dashboard" className="text-sm hover:text-violet-400 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-3">Nuova candidatura</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Incolla l'offerta di lavoro e lascia fare il resto a Claude.
          </p>
        </div>

        <GenerateForm />
      </main>
    </>
  )
}
