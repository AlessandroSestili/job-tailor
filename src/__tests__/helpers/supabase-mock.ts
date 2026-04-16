import { vi } from 'vitest'

/**
 * Creates a chainable Supabase mock.
 * Usage: mockSupabase({ session, profileData, jobData, generationData })
 */
export function mockSupabase({
  session = null as { user: { id: string; email: string } } | null,
  profileData = null as object | null,
  jobData = null as object | null,
  generationsData = [] as object[],
  generationData = null as object | null,
  insertResult = null as object | null,
} = {}) {
  const singleFn = vi.fn()
  const selectFn = vi.fn()
  const eqFn = vi.fn()
  const insertFn = vi.fn()
  const updateFn = vi.fn()
  const orderFn = vi.fn()
  const limitFn = vi.fn()

  // Chain: .from().select().eq().single()
  singleFn.mockResolvedValue({ data: profileData, error: profileData ? null : { code: 'PGRST116' } })
  eqFn.mockReturnValue({ single: singleFn, order: orderFn, limit: limitFn })
  orderFn.mockResolvedValue({ data: generationsData, error: null })
  limitFn.mockReturnValue({ single: singleFn })
  selectFn.mockReturnValue({ eq: eqFn, order: orderFn })

  // .from().insert().select().single()
  const insertSelectFn = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: insertResult, error: null }) })
  insertFn.mockReturnValue({ select: insertSelectFn })

  // .from().update().eq()
  updateFn.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: insertResult, error: null }) })

  const fromFn = vi.fn().mockReturnValue({
    select: selectFn,
    insert: insertFn,
    update: updateFn,
  })

  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
    from: fromFn,
    _mocks: { fromFn, selectFn, eqFn, singleFn, insertFn, updateFn },
  }
}

export type MockSupabase = ReturnType<typeof mockSupabase>
