import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockSupabase } from '../helpers/supabase-mock'

vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn() }))

const { createServerClient } = await import('@supabase/ssr')

const SAMPLE_PROFILE = {
  id: 'profile-1',
  user_id: 'user-1',
  structured_data: { personal: { name: 'Mario Rossi' }, experience: [], education: [], skills: [], languages: [], certifications: [], projects: [] },
  free_text: 'Test user',
  preferences: { tone: 'neutral' },
  updated_at: new Date().toISOString(),
}

const SESSION = { user: { id: 'user-1', email: 'mario@test.com' } }

function makeRequest(method = 'GET', body?: object) {
  return new NextRequest('http://localhost:3000/api/profile', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

describe('GET /api/profile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: null }) as ReturnType<typeof createServerClient>
    )
    const { GET } = await import('../../app/api/profile/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns profile when authenticated', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: SESSION, profileData: SAMPLE_PROFILE }) as ReturnType<typeof createServerClient>
    )
    const { GET } = await import('../../app/api/profile/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('profile-1')
  })

  it('returns 404 when authenticated but no profile', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: SESSION, profileData: null }) as ReturnType<typeof createServerClient>
    )
    const { GET } = await import('../../app/api/profile/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(404)
  })
})

describe('POST /api/profile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: null }) as ReturnType<typeof createServerClient>
    )
    const { POST } = await import('../../app/api/profile/route')
    const res = await POST(makeRequest('POST', { free_text: 'test' }))
    expect(res.status).toBe(401)
  })

  it('saves profile and returns updated data', async () => {
    const updated = { ...SAMPLE_PROFILE, free_text: 'Updated bio' }
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase({ session: SESSION, profileData: SAMPLE_PROFILE, insertResult: updated }) as ReturnType<typeof createServerClient>
    )
    const { POST } = await import('../../app/api/profile/route')
    const res = await POST(makeRequest('POST', { free_text: 'Updated bio', preferences: { tone: 'formal' } }))
    expect(res.status).toBe(200)
  })
})
