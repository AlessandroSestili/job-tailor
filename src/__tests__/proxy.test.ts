import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock @supabase/ssr before importing proxy
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { proxy } from '../proxy'

function makeRequest(path: string) {
  return new NextRequest(`http://localhost:3000${path}`)
}

function makeSupabaseMock(session: { user: { email: string } } | null) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: session ? { id: 'profile-1' } : null,
            error: null,
          }),
        }),
      }),
    }),
  }
}

const { createServerClient } = await import('@supabase/ssr')

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated user to /login on protected route', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock(null) as ReturnType<typeof createServerClient>
    )

    const req = makeRequest('/dashboard')
    const res = await proxy(req)

    expect(res).toBeInstanceOf(NextResponse)
    expect(res?.headers.get('location')).toContain('/login')
  })

  it('allows unauthenticated user through on /login', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock(null) as ReturnType<typeof createServerClient>
    )

    const req = makeRequest('/login')
    const res = await proxy(req)

    // Should not redirect to login — null (next()) or redirect elsewhere
    const location = res?.headers.get('location')
    expect(location === null || !location.includes('/login')).toBe(true)
  })

  it('redirects authenticated user without profile to /onboarding', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-1', email: 'test@test.com' } } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase as ReturnType<typeof createServerClient>
    )

    const req = makeRequest('/dashboard')
    const res = await proxy(req)

    expect(res?.headers.get('location')).toContain('/onboarding')
  })

  it('allows authenticated user with profile to access /dashboard', async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-1', email: 'test@test.com' } } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'profile-1' }, error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabase as ReturnType<typeof createServerClient>
    )

    const req = makeRequest('/dashboard')
    const res = await proxy(req)

    // Should call next() — no redirect
    const location = res?.headers.get('location')
    expect(location).toBeNull()
  })
})
