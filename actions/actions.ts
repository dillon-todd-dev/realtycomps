'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function login(previousFormData: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });
}
