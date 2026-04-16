import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockSupabase } from '../helpers/supabase-mock'

vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/ai', () => ({
  ai: {
    extractJobFromText: vi.fn().mockResolvedValue({
      title: 'Engineer', company: 'Acme', language: 'en', requirements: [], responsibilities: [],
    }),
    generateTailoredCv: vi.fn().mockResolvedValue({
      personal: { name: 'Mario' }, experience: [], education: [], skills: [], languages: [],
    }),
    generateCoverLetter: vi.fn().mockResolvedValue('Dear Hiring Manager...'),
  },
}))

const { createServerClient } = await import('@supabase/ssr')

const SESSION = { user: { id: 'user-1', email: 'mario@test.com' } }
const SAMPLE_PROFILE = {
  id: 'profile-1',
  structured_data: { personal: { name: 'Mario' }, experience: [], education: [], skills: [], languages: [], certifications: [], projects: [] },
}
const SAMPLE_JOB = { id: 'job-1', structured_data: { title: 'Engineer', company: 'Acme', language: 'en', requirements: [], responsibilities: [] } }
const SAMPLE_GENERATION = { id: 'gen-1', tailored_cv: {}, cover_letter: 'test', created_at: new Date().toISOString() }

function makeRequest(body?: object) {
  return new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  })
}

describe('POST /api/generate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: null }) as ReturnType<typeof createServerClient>
    )
    const { POST } = await import('../../app/api/generate/route')
    const res = await POST(makeRequest({ source_type: 'text', source_value: 'job text' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when source_value is missing', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: SESSION, profileData: SAMPLE_PROFILE }) as ReturnType<typeof createServerClient>
    )
    const { POST } = await import('../../app/api/generate/route')
    const res = await POST(makeRequest({ source_type: 'text' }))
    expect(res.status).toBe(400)
  })

  it('generates CV and cover letter, returns generation id', async () => {
    const mockSupa = mockSupabase({ session: SESSION, profileData: SAMPLE_PROFILE, insertResult: SAMPLE_GENERATION })
    // Override from to return job on jobs insert and generation on generations insert
    const originalFrom = mockSupa.from
    let callCount = 0
    mockSupa.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'master_profiles') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: SAMPLE_PROFILE, error: null }) }) }) }
      }
      if (table === 'jobs') {
        return { insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: SAMPLE_JOB, error: null }) }) }) }
      }
      if (table === 'generations') {
        return { insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: SAMPLE_GENERATION, error: null }) }) }) }
      }
      return originalFrom(table)
    })

    vi.mocked(createServerClient).mockReturnValue(mockSupa as ReturnType<typeof createServerClient>)
    const { POST } = await import('../../app/api/generate/route')
    const res = await POST(makeRequest({ source_type: 'text', source_value: 'We need an engineer' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.generation_id).toBe('gen-1')
  })
})

describe('GET /api/generations', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: null }) as ReturnType<typeof createServerClient>
    )
    const { GET } = await import('../../app/api/generations/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/generations'))
    expect(res.status).toBe(401)
  })

  it('returns list of generations', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: SESSION, generationsData: [SAMPLE_GENERATION] }) as ReturnType<typeof createServerClient>
    )
    const { GET } = await import('../../app/api/generations/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/generations'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })
})
