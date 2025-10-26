'use server';

import { LoginFormSchema, LoginFormState } from '@/lib/schema';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db/drizzle';
import { usersTable } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
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

  const user = await db.query.usersTable.findFirst({
    where: and(
      eq(usersTable.email, email),
      eq(usersTable.hasSetPassword, true),
      eq(usersTable.isActive, true),
    ),
  });

  if (!user || !user.password) {
    return {
      message: 'An error occured while trying to log you in. Please try again.',
    };
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return {
      message: 'An error occured while trying to log you in. Please try again.',
    };
  }

  await createSession(user.id);

  return {
    success: true,
    message: `Welcome back, ${user.firstName}`,
  };
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
