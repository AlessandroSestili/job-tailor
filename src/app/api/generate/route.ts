import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ai } from '@/lib/ai'
import { load } from 'cheerio'

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
    $('script, style, nav, header, footer').remove()
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

  if (!source_value) {
    return NextResponse.json({ error: 'source_value is required' }, { status: 400 })
  }

  // 1. Fetch master profile
  const { data: profile, error: profileError } = await supabase
    .from('master_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Master profile not found' }, { status: 404 })
  }

  // 2. Extract job
  const text = await fetchJobText(source_type ?? 'text', source_value)
  const jobData = await ai.extractJobFromText(text)

  // 3. Save job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      user_id: session.user.id,
      source_type: source_type ?? 'text',
      source_value,
      structured_data: jobData,
    })
    .select()
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
  }

  // 4. Generate tailored CV + cover letter in parallel
  const [tailored_cv, cover_letter] = await Promise.all([
    ai.generateTailoredCv(profile.structured_data, jobData),
    ai.generateCoverLetter(profile.structured_data, jobData),
  ])

  // 5. Save generation
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      user_id: session.user.id,
      master_profile_id: profile.id,
      job_id: job.id,
      tailored_cv,
      cover_letter,
    })
    .select()
    .single()

  if (genError || !generation) {
    return NextResponse.json({ error: 'Failed to save generation' }, { status: 500 })
  }

  return NextResponse.json({ generation_id: generation.id })
}
