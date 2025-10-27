import CreateUserForm from '@/components/create-user-form';
import { requireAdmin } from '@/lib/session';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateUserPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title='Create New User'
        description='Add a new user to the system'
        action={
          <Button variant='outline' asChild>
            <Link href='/dashboard/users'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Users
            </Link>
          </Button>
        }
      />

      <div className='p-6'>
        <CreateUserForm />
      </div>
    </>
  );
}
