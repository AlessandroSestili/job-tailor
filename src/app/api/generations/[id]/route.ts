import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function getSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase(request)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: generation, error } = await supabase
    .from('generations')
    .select('*, jobs(*), master_profiles(structured_data, preferences)')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !generation) {
    return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
  }

  return NextResponse.json(generation)
}
