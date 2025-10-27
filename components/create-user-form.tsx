'use client';

import { createUserByAdmin } from '@/actions/users';
import { useActionState, useEffect } from 'react';
import { SubmitButton } from './submit-button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateUserForm() {
  const [state, action, isLoading] = useActionState(
    createUserByAdmin,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className='w-full max-w-4xl'>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className='space-y-8'>
            {/* Email - full width with larger input */}
            <div className='space-y-3'>
              <Label htmlFor='email' className='text-base font-medium'>
                Email Address
              </Label>
              <Input
                type='email'
                name='email'
                id='email'
                required
                placeholder='user@example.com'
                className='h-12 text-base'
              />
            </div>

            {/* First and Last Name - responsive grid with proper spacing */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='space-y-3'>
                <Label htmlFor='firstName' className='text-base font-medium'>
                  First Name
                </Label>
                <Input
                  type='text'
                  name='firstName'
                  id='firstName'
                  required
                  placeholder='John'
                  className='h-12 text-base'
                />
              </div>

              <div className='space-y-3'>
                <Label htmlFor='lastName' className='text-base font-medium'>
                  Last Name
                </Label>
                <Input
                  type='text'
                  name='lastName'
                  id='lastName'
                  required
                  placeholder='Doe'
                  className='h-12 text-base'
                />
              </div>
            </div>

            {/* Role - constrained width but larger select */}
            <div className='space-y-3 max-w-md'>
              <Label htmlFor='role' className='text-base font-medium'>
                User Role
              </Label>
              <Select name='role' defaultValue='ROLE_USER'>
                <SelectTrigger className='h-12 text-base'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ROLE_USER'>User</SelectItem>
                  <SelectItem value='ROLE_ADMIN'>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error/Success Messages */}
            {state?.error && (
              <Alert variant='destructive'>
                <AlertDescription className='text-base'>
                  {state.error}
                </AlertDescription>
              </Alert>
            )}

            {state?.success && (
              <Alert className='border-green-200 bg-green-50'>
                <AlertDescription className='text-green-800 text-base'>
                  {state.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button - larger and more prominent */}
            <div className='pt-6'>
              <SubmitButton
                text='Send Invitation'
                isLoading={isLoading}
                styles='h-12 px-8 text-base min-w-48'
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
