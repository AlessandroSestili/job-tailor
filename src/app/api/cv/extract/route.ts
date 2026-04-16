import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ai } from '@/lib/ai'

function getSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase(request)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { pdf_base64 } = body

  if (!pdf_base64) {
    return NextResponse.json({ error: 'pdf_base64 is required' }, { status: 400 })
  }

  const structured_data = await ai.extractCvFromPdf(pdf_base64)

  // Upsert master_profile with extracted data
  const { data: profile, error } = await supabase
    .from('master_profiles')
    .upsert(
      { user_id: session.user.id, structured_data },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  return NextResponse.json(profile)
}
