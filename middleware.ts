import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware: Processing request for:', request.nextUrl.pathname)
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    console.log('🔍 Middleware: Supabase client created')
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('🔍 Middleware: User check:', { user: user?.id, error })

    // Redirect to login if not authenticated and trying to access protected routes
    if (!user && (request.nextUrl.pathname.startsWith('/patient') || 
                  request.nextUrl.pathname.startsWith('/doctor') || 
                  request.nextUrl.pathname.startsWith('/pharmacist'))) {
      console.log('🔍 Middleware: Redirecting to login - no user')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If authenticated, check role-based access
    if (user) {
      console.log('🔍 Middleware: User authenticated, checking profile')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('🔍 Middleware: Profile check:', { profile, profileError })

      if (profile) {
        const userRole = profile.role.toLowerCase()
        const pathname = request.nextUrl.pathname
        console.log('🔍 Middleware: User role:', userRole, 'Path:', pathname)

        // Redirect to appropriate dashboard based on role
        if (pathname === '/' || pathname === '/dashboard') {
          console.log('🔍 Middleware: Redirecting to role dashboard:', userRole)
          return NextResponse.redirect(new URL(`/${userRole}`, request.url))
        }

        // Prevent access to other role dashboards
        if (pathname.startsWith('/patient') && userRole !== 'patient') {
          console.log('🔍 Middleware: Wrong role access - redirecting to:', userRole)
          return NextResponse.redirect(new URL(`/${userRole}`, request.url))
        }
        if (pathname.startsWith('/doctor') && userRole !== 'doctor') {
          console.log('🔍 Middleware: Wrong role access - redirecting to:', userRole)
          return NextResponse.redirect(new URL(`/${userRole}`, request.url))
        }
        if (pathname.startsWith('/pharmacist') && userRole !== 'pharmacist') {
          console.log('🔍 Middleware: Wrong role access - redirecting to:', userRole)
          return NextResponse.redirect(new URL(`/${userRole}`, request.url))
        }
      }
    }

    console.log('🔍 Middleware: Allowing request to proceed')
    return response
  } catch (error) {
    console.error('❌ Middleware: Error occurred:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}