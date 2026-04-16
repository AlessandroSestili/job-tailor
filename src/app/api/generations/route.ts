import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function getSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase(request)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: generations, error } = await supabase
    .from('generations')
    .select('id, created_at, tailored_cv, cover_letter, job_id')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 })
  }

  return NextResponse.json(generations ?? [])
}
