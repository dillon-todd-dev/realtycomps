'server only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { ENV } from '@/lib/env';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { User } from './types';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema';

const SESSION_SECRET = ENV.SESSION_SECRET;
const ENCODED_KEY = new TextEncoder().encode(SESSION_SECRET);

export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if < 5 min left

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(ENCODED_KEY);
}

export async function decrypt(
  session: string | undefined = '',
): Promise<SessionPayload> {
  const { payload } = await jwtVerify(session, ENCODED_KEY, {
    algorithms: ['HS256'],
  });
  return payload as SessionPayload;
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const session = await encrypt({
    userId,
    expiresAt,
  });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession(): Promise<void> {
  const session = (await cookies()).get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return;
  }

  const expires = new Date(Date.now() + SESSION_DURATION);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const cookie = (await cookies()).get('session')?.value;
  if (!cookie) {
    redirect('/login');
  }

  try {
    const session = await decrypt(cookie);

    if (!session?.userId) {
      redirect('/login');
    }

    if (new Date(session.expiresAt) < new Date()) {
      redirect('/login');
    }

    return session;
  } catch (err) {
    redirect('/login');
  }
});

export const requireUser = cache(async (): Promise<User> => {
  const session = await verifySession();

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.userId),
  });

  if (!user || !user.isActive) {
    redirect('/login');
  }

  return user;
});

export const requireAdmin = cache(async (): Promise<User> => {
  const user = await requireUser();

  if (user.role !== 'ROLE_ADMIN') {
    redirect('/dashboard');
  }

  return user;
});
