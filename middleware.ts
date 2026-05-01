import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/lib/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin and /api/* don't go through i18n.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    // Dev-only impersonation: visiting /admin?as=owner|staff|customer|none sets a cookie
    // so checkAdminAccess can grant the chosen role. No-op when Supabase is configured.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && pathname.startsWith('/admin')) {
      const as = request.nextUrl.searchParams.get('as');
      if (as && ['owner', 'staff', 'customer', 'none'].includes(as)) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('as');
        const res = NextResponse.redirect(url);
        if (as === 'none') {
          res.cookies.delete('amis-admin-impersonate');
        } else {
          res.cookies.set('amis-admin-impersonate', as, {
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
          });
        }
        return res;
      }
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return updateSession(request);
    }
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Refresh Supabase session cookie alongside i18n response.
    const supaResponse = await updateSession(request);
    supaResponse.cookies.getAll().forEach((c) => {
      intlResponse.cookies.set(c.name, c.value);
    });
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Skip Next internals + static assets
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
