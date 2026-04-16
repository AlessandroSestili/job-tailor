import { AuthForm } from '@/components/auth/AuthForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 dot-grid relative overflow-hidden">
      {/* Orbs */}
      <div className="orb-violet w-96 h-96 -top-20 -left-20 opacity-60" />
      <div className="orb-cyan w-80 h-80 -bottom-10 -right-10 opacity-40" />
      <AuthForm />
    </main>
  )
}
