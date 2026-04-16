import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Creates a Supabase client for use inside Next.js Route Handlers.
 * Handles cookie reading/writing correctly.
 */
export async function createRouteClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Route handler context — cookie writes may be ignored
          }
        },
      },
    }
  )
}

/**
 * Validates the session from the request. Returns session or a 401 Response.
 */
export async function requireAuth(supabase: Awaited<ReturnType<typeof createRouteClient>>) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { session, error: null }
}

/**
 * Creates a Supabase client directly from a Request (for middleware-style tests).
 * Used in tests where we mock createServerClient directly.
 */
export function createClientFromRequest(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}
