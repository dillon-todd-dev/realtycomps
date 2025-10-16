import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;

  const isProtectedRoute =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/properties') ||
    req.nextUrl.pathname.startsWith('/investors') ||
    req.nextUrl.pathname.startsWith('/users');

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session) {
    try {
      const payload = await decrypt(session);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', payload.userId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('session');
      return response;
    }
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
