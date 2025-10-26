// components/create-user-form.tsx
'use client';

import { createUserByAdmin } from '@/actions/users';
import { useActionState } from 'react';
import { SubmitButton } from './submit-button';

export default function CreateUserForm() {
  const [state, action, isLoading] = useActionState(
    createUserByAdmin,
    undefined,
  );

  return (
    <form action={action} className='space-y-4 max-w-md'>
      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-700'
        >
          Email
        </label>
        <input
          type='email'
          name='email'
          id='email'
          required
          className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          placeholder='user@example.com'
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='firstName'
            className='block text-sm font-medium text-gray-700'
          >
            First Name
          </label>
          <input
            type='text'
            name='firstName'
            id='firstName'
            required
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            placeholder='John'
          />
        </div>

        <div>
          <label
            htmlFor='lastName'
            className='block text-sm font-medium text-gray-700'
          >
            Last Name
          </label>
          <input
            type='text'
            name='lastName'
            id='lastName'
            required
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            placeholder='Doe'
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='role'
          className='block text-sm font-medium text-gray-700'
        >
          Role
        </label>
        <select
          name='role'
          id='role'
          className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
        >
          <option value='ROLE_USER'>User</option>
          <option value='ROLE_ADMIN'>Admin</option>
        </select>
      </div>

      {state?.error && (
        <div className='rounded-md bg-red-50 p-4'>
          <p className='text-sm text-red-800'>{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className='rounded-md bg-green-50 p-4'>
          <p className='text-sm text-green-800'>{state.message}</p>
        </div>
      )}

      <SubmitButton text='Send Invitation' isLoading={isLoading} />
    </form>
  );
}
