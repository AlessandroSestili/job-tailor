export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { ResultView } from '@/components/result/ResultView'

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: generation } = await supabase
    .from('generations')
    .select('*, jobs(structured_data)')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!generation) notFound()

  const job = generation.jobs?.structured_data

  return (
    <>
      <Navbar userEmail={session.user.email} />
      <ResultView
        generationId={id}
        tailoredCv={generation.tailored_cv}
        coverLetter={generation.cover_letter}
        jobTitle={job?.title}
        company={job?.company}
        createdAt={generation.created_at}
      />
    </>
  )
}
