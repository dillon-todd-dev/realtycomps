import CreateUserForm from '@/components/create-user-form';
import { requireAdmin } from '@/lib/session';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AddPropertyPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title='Add Property'
        description='Add a new Property'
        action={
          <Button variant='outline' asChild>
            <Link href='/dashboard/properties'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Properties
            </Link>
          </Button>
        }
      />

      <div className='p-6'>Add property form</div>
    </>
  );
}
