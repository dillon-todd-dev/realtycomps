'use server';

import { auth } from '@/lib/auth';
import { loginSchema } from '@/lib/schema';
import { headers } from 'next/headers';
import { treeifyError } from 'zod';

export async function login(_: unknown, formData: FormData) {
  const formValues = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { success, data, error } = loginSchema.safeParse(formValues);

  if (!success) {
    return {
      errors: treeifyError(error).errors,
      values: formValues,
    };
  }

  await auth.api.signInEmail({
    body: { email: data.email, password: data.password },
    headers: await headers(),
  });
}

export async function signUpUser() {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        name: 'Dillon Todd',
        email: 'dillontodd10@gmail.com',
        password: 'Lime123^',
      },
    });

    console.log(data);
  } catch (err) {
    console.log('Error creating user:', err);
  }
}
