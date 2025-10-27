import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/set-password'];

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const hasSession = req.cookies.has('session');

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const url = new URL('/login', req.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing public routes with session
  if (isPublicRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
