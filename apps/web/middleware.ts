import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/my-bookings',
  '/profile',
  '/business/dashboard',
  '/business/messages',
  '/business/quotes',
];

// Routes that require admin (owner) access
const adminRoutes = ['/admin'];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client using the new SSR package
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Check protected routes - redirect to login if not authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin routes - require both authentication and owner email
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // Not authenticated - redirect to admin login
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Check if user email is in owner emails list
    const ownerEmails = (process.env.OWNER_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = session.user.email?.toLowerCase() || '';

    // If no owner emails configured, deny access (don't allow any by default)
    if (ownerEmails.length === 0) {
      console.warn(
        'OWNER_EMAILS not configured - admin access denied for:',
        userEmail
      );
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // User email not in owner list - redirect to dashboard
    if (!ownerEmails.includes(userEmail)) {
      console.warn('Admin access denied for non-owner email:', userEmail);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-bookings/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/business/dashboard/:path*',
    '/business/messages/:path*',
    '/business/quotes/:path*',
  ],
};
