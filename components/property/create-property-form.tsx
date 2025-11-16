'use client';

import { useActionState, useEffect } from 'react';
import { SubmitButton } from './submit-button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPropertyAction } from '@/actions/properties';
import { useRouter } from 'next/navigation';

export default function CreatePropertyForm() {
  const router = useRouter();
  const [state, action, isLoading] = useActionState(
    createPropertyAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push('/dashboard/properties');
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className='w-full max-w-4xl'>
      <Card>
        <CardHeader>
          <CardTitle>Property Address</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className='space-y-8'>
            <div className='space-y-3'>
              <Label htmlFor='address' className='text-base font-medium'>
                Address
              </Label>
              <Input
                type='text'
                name='address'
                id='address'
                required
                placeholder='123 Main Street'
                className='h-12 text-base'
              />
            </div>

            <div className='space-y-3'>
              <Label htmlFor='city' className='text-base font-medium'>
                City
              </Label>
              <Input
                type='text'
                name='city'
                id='city'
                required
                placeholder='Houston'
                className='h-12 text-base'
              />
            </div>

            <div className='space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='space-y-3'>
                <Label htmlFor='state' className='text-base font-medium'>
                  State
                </Label>
                <Input
                  type='text'
                  name='state'
                  id='state'
                  required
                  placeholder='TX'
                  className='h-12 text-base'
                />
              </div>

              <div className='space-y-3 max-w-md'>
                <Label htmlFor='postalCode' className='text-base font-medium'>
                  Postal Code
                </Label>
                <Input
                  type='text'
                  name='postalCode'
                  id='postalCode'
                  required
                  placeholder='77346'
                  className='h-12 text-base'
                />
              </div>
            </div>

            <div className='pt-6'>
              <SubmitButton
                text='Add Property'
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
