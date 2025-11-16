import UsersDataTable from '@/components/user/users-data-table';
import { getUsers } from '@/actions/users';
import { requireAdmin } from '@/lib/session';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const user = await requireAdmin();

  const initialData = await getUsers({
    userId: user.id,
    page: 1,
    pageSize: 10,
  });

  return (
    <>
      <PageHeader
        title='User Management'
        description='Manage all of your users here'
        action={
          <Button asChild>
            <Link href='/dashboard/users/create'>
              <Plus className='h-4 w-4 mr-2' />
              Add User
            </Link>
          </Button>
        }
      />

      <div className='p-6'>
        <UsersDataTable userId={user.id} initialData={initialData} />
      </div>
    </>
  );
}
