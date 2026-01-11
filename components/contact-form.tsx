'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { submitContactForm } from '@/actions/contact';

export function ContactForm() {
  const [state, action, isPending] = useActionState(
    submitContactForm,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  if (state?.success) {
    return (
      <div className='rounded-md bg-green-50 p-4 text-green-800'>
        {state.message}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className='space-y-5'>
      {state?.message && !state.success && (
        <div className='rounded-md bg-red-50 p-4 text-red-800'>
          {state.message}
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='name' className='font-semibold'>
          Name
        </Label>
        <Input
          id='name'
          name='name'
          type='text'
          placeholder='Enter your name here...'
          required
          disabled={isPending}
        />
        {state?.errors?.name && (
          <p className='text-sm text-red-500'>{state.errors.name[0]}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email' className='font-semibold'>
          Email
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='Enter your Email here...'
          required
          disabled={isPending}
        />
        {state?.errors?.email && (
          <p className='text-sm text-red-500'>{state.errors.email[0]}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone' className='font-semibold'>
          Phone
        </Label>
        <Input
          id='phone'
          name='phone'
          type='tel'
          placeholder='Enter your phone number...'
          disabled={isPending}
        />
        {state?.errors?.phone && (
          <p className='text-sm text-red-500'>{state.errors.phone[0]}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='message' className='font-semibold'>
          Message
        </Label>
        <textarea
          id='message'
          name='message'
          rows={4}
          placeholder='Enter your message'
          required
          disabled={isPending}
          className='border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
        />
        {state?.errors?.message && (
          <p className='text-sm text-red-500'>{state.errors.message[0]}</p>
        )}
      </div>

      <Button type='submit' className='w-full' disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <Send className='ml-2 h-4 w-4' />
          </>
        )}
      </Button>
    </form>
  );
}
