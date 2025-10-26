'use client';

import { User } from '@/lib/types';
import { format } from 'date-fns';

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
      <table className='min-w-full divide-y divide-gray-300'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              User
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Role
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Status
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Created
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {users.map((user) => (
            <tr key={user.id}>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div>
                  <div className='text-sm font-medium text-gray-900'>
                    {user.firstName} {user.lastName}
                  </div>
                  <div className='text-sm text-gray-500'>{user.email}</div>
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'ROLE_ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </span>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex flex-col gap-1'>
                  <span
                    className={`inline-flex text-xs ${
                      user.isActive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {user.isActive ? '● Active' : '● Inactive'}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {user.hasSetPassword
                      ? 'Password set'
                      : 'Invitation pending'}
                  </span>
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {format(user.createdAt, 'MMM d, yyyy')}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                <button className='text-indigo-600 hover:text-indigo-900 mr-4'>
                  Edit
                </button>
                <button className='text-red-600 hover:text-red-900'>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
