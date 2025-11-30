import UsersDataTable from '@/components/user/users-data-table';
import { getUsers } from '@/actions/users';
import { requireAdmin } from '@/lib/session';

export default async function AdminUsersPage() {
  const user = await requireAdmin();

  const initialData = await getUsers({
    userId: user.id,
    page: 1,
    pageSize: 10,
  });

  return <UsersDataTable userId={user.id} initialData={initialData} />;
}
