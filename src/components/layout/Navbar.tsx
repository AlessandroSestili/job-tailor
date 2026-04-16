'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!userEmail) return null

  return (
    <nav
      className="sticky top-0 z-50 h-16 flex items-center px-6"
      style={{
        background: 'rgba(5,5,16,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold text-gradient">
          JobTailor
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {userEmail}
          </span>
          <button onClick={handleLogout} className="btn-secondary !py-2 !px-4 text-sm">
            Esci
          </button>
        </div>
      </div>
    </nav>
  )
}
