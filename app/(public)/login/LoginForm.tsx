'use client';

import { login } from '@/actions/actions';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState } from 'react';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

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
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          type='password'
          name='password'
          placeholder='********'
          required
        />
      </div>
      <p>
        Access to RealtyComps is restricted to clients and/or customers of JDees
        Investments, Inc.
      </p>
      <SubmitButton text='Login' isLoading={pending} />
    </form>
  );
}
