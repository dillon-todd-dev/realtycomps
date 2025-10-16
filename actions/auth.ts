'use server';

import { LoginFormSchema, LoginFormState } from '@/lib/definitions';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function login(
  state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const result = await db.select().from(users).where(eq(users.email, email));
  const passwordMatches = await bcrypt.compare(
    password,
    result[0]?.password || '',
  );

  if (result.length === 0 || !passwordMatches) {
    return {
      message: 'An error occured while trying to log you in. Please try again.',
    };
  }

  const user = result[0];

  await createSession(user.id);

  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
