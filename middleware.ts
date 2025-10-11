import { NextRequest, NextResponse } from 'next/server';
import {
  encrypt,
  decrypt,
  SESSION_DURATION,
  SESSION_REFRESH_THRESHOLD,
} from '@/lib/session';

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get('session')?.value;
  const payload = await decrypt(cookie);

  if (!payload) {
    return NextResponse.next();
  }

  if (payload.expiresAt.getTime() - Date.now() < SESSION_REFRESH_THRESHOLD) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    const refreshedSession = await encrypt({
      ...payload,
      expiresAt,
    });

    const response = NextResponse.next();
    response.cookies.set('session', refreshedSession, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
};
