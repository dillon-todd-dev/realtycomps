import { requireUser } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CreatePropertyForm from '@/components/property/create-property-form';

export default async function AddPropertyPage() {
  await requireUser();

  return (
    <>
      <div className='flex h-14 items-center border-b bg-background px-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/dashboard/properties'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Properties
          </Link>
        </Button>
      </div>
      <div className='flex justify-center px-6 py-12'>
        <CreatePropertyForm />
      </div>
    </>
  );
}
