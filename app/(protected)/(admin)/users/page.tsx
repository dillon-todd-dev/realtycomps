import CreateUserForm from '@/components/create-user-form';
import UsersTable from '@/components/users-table';
import { db } from '@/db/drizzle';

export default async function AdminUsersPage() {
  const users = await db.query.usersTable.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-8'>
              User Management
            </h1>

            {/* Create User Form */}
            <div className='mb-8 pb-8 border-b border-gray-200'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Create New User
              </h2>
              <CreateUserForm />
            </div>

            {/* Users Table */}
            <div>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                All Users
              </h2>
              <UsersTable users={users} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
