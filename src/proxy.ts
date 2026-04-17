import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_ROUTES = ['/dashboard', '/generate', '/result', '/onboarding', '/profile']
const AUTH_ROUTES = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  if (!isProtected && !isAuthRoute) return NextResponse.next()

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // No session → redirect to login (unless already there)
  if (!session) {
    if (isAuthRoute) return response
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user on /login → redirect to dashboard
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Authenticated but no master profile → redirect to onboarding
  // (skip this check if already on /onboarding)
  if (!pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase
      .from('master_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|x-preview).*)'],
}
