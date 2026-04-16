import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function getSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase(request)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('master_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(profile)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase(request)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { free_text, preferences } = body

  const { data: updated, error } = await supabase
    .from('master_profiles')
    .update({ free_text, preferences })
    .eq('user_id', session.user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json(updated ?? { ok: true })
}
