'use client';

import { login } from '@/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState } from 'react';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className='flex flex-col gap-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          type='email'
          name='email'
          placeholder='example@example.com'
          required
        />
        {state?.errors?.email && <p>{state.errors.email}</p>}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          type='password'
          name='password'
          placeholder='********'
          required
        />
        {state?.errors?.password && (
          <div>
            <p>Passowrd Must:</p>
            <ul>
              {state.errors.password.map((err) => (
                <li key={err}>- {err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p>
        Access to RealtyComps is restricted to clients and/or customers of JDees
        Investments, Inc.
      </p>
      <SubmitButton text='Login' isLoading={pending} />
    </form>
  );
}
