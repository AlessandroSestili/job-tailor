import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { load } from 'cheerio'
import { ai } from '@/lib/ai'

function getSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

async function fetchJobText(sourceType: string, sourceValue: string): Promise<string> {
  if (sourceType === 'url') {
    if (sourceValue.includes('linkedin.com')) {
      throw new Error('LinkedIn non è supportato. Incolla il testo dell\'offerta direttamente.')
    }
    const res = await fetch(sourceValue, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const $ = load(html)
    // Remove scripts, styles, nav
    $('script, style, nav, header, footer, [aria-hidden="true"]').remove()
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000)
  }
  return sourceValue
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase(request)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { source_type, source_value } = body

  if (!source_type || !source_value) {
    return NextResponse.json({ error: 'source_type and source_value are required' }, { status: 400 })
  }

  const text = await fetchJobText(source_type, source_value)
  const structured_data = await ai.extractJobFromText(text)

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({ user_id: session.user.id, source_type, source_value, structured_data })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
  }

  return NextResponse.json(job)
}
