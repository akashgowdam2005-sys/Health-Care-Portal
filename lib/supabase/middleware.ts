import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value }: any) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const path = request.nextUrl.pathname;

    if (profile?.role === 'patient' && path.startsWith('/doctor')) {
      return NextResponse.redirect(new URL('/patient', request.url));
    }

    if (profile?.role === 'doctor' && path.startsWith('/patient')) {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }

    if (path === '/' || path === '/login' || path === '/signup') {
      const redirectPath = profile?.role === 'doctor' ? '/doctor' : '/patient';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return supabaseResponse;
};
