'use server';

import { LoginFormSchema, LoginFormState } from '@/lib/definitions';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import z from 'zod';

export async function login(state: LoginFormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error).errors,
    };
  }

  const { email, password } = validatedFields.data;

  const user = {};

  if (!user) {
    return {
      message: 'An error occured while trying to log you in. Please try again.',
    };
  }

  await createSession('', '', '', '');

  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
