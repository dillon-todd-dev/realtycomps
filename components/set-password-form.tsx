'use client';

import { useActionState } from 'react';
import { acceptInvitation } from '@/actions/users';
import { SubmitButton } from '@/components/submit-button';

type SetPasswordProps = {
  token: string;
};

export default function SetPasswordForm({ token }: SetPasswordProps) {
  const acceptInvitationWithToken = acceptInvitation.bind(null, token);
  const [state, action, isLoading] = useActionState(
    acceptInvitationWithToken,
    undefined,
  );

  return (
    <form action={action} className='mt-8 space-y-6'>
      <div className='space-y-4'>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700'
          >
            New Password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            placeholder='Enter your password'
            minLength={8}
          />
        </div>

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-gray-700'
          >
            Confirm Password
          </label>
          <input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            required
            className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            placeholder='Confirm your password'
            minLength={8}
          />
        </div>
      </div>

      {state?.error && (
        <div className='rounded-md bg-red-50 p-4'>
          <p className='text-sm text-red-800'>{state.error}</p>
        </div>
      )}

      <div className='space-y-3'>
        <SubmitButton text='Set Password' isLoading={isLoading} />

        <p className='text-xs text-center text-gray-500'>
          By setting your password, you agree to RealtyComps terms and
          conditions
        </p>
      </div>
    </form>
  );
}
