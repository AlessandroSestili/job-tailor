export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { ProfileEditor } from '@/components/profile/ProfileEditor'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('master_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return (
    <>
      <Navbar userEmail={session.user.email} />
      <ProfileEditor initialProfile={profile} />
    </>
  )
}
