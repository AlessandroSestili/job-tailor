import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
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
        <OnboardingWizard />
      </div>
    </main>
  )
}
