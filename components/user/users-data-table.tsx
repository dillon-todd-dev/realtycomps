'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { getUsers, updateUserStatus } from '@/actions/users';
import { User } from '@/lib/types';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';

interface UsersDataTableProps {
  userId: string;
  initialData: {
    users: User[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
}

export default function UsersDataTable({
  userId,
  initialData,
}: UsersDataTableProps) {
  const [users, setUsers] = useState(initialData.users);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [pageCount, setPageCount] = useState(initialData.pageCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter] = useState<'all' | 'ROLE_USER' | 'ROLE_ADMIN'>('all');
  const [statusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>(
    'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await getUsers({
          userId,
          page: currentPage,
          pageSize,
          search: debouncedSearch,
          role: roleFilter === 'all' ? undefined : roleFilter,
          status: statusFilter as 'active' | 'inactive' | 'all',
          sortBy,
          sortOrder,
        });

        setUsers(result.users);
        setTotalCount(result.totalCount);
        setPageCount(result.pageCount);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to fetch users');
      }
    });
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    userId,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: 'name' | 'email' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  return (
    <>
      <div className='flex h-14 items-center justify-between border-b bg-background px-6'>
        <div className='flex flex-col justify-center'>
          <h1 className='text-lg font-semibold text-foreground'>
            User Management
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage all of your users here
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Input
            placeholder='Search users...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='min-w-sm'
          />
          <Button asChild>
            <Link href='/dashboard/users/create'>
              <Plus className='h-4 w-4 mr-2' />
              Add User
            </Link>
          </Button>
        </div>
      </div>
      <div className='space-y-6 p-6'>
        {/* Table - Much better spacing and layout */}
        <Card>
          <CardContent className='p-0'>
            <div className='relative'>
              {isPending && (
                <div className='absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead
                      className='cursor-pointer py-4 px-6 font-semibold'
                      onClick={() => handleSort('name')}
                    >
                      <div className='flex items-center gap-2'>
                        User
                        {sortBy === 'name' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className='cursor-pointer py-4 px-6 font-semibold'
                      onClick={() => handleSort('email')}
                    >
                      <div className='flex items-center gap-2'>
                        Email
                        {sortBy === 'email' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className='py-4 px-6 font-semibold'>
                      Role
                    </TableHead>
                    <TableHead className='py-4 px-6 font-semibold'>
                      Status
                    </TableHead>
                    <TableHead
                      className='cursor-pointer py-4 px-6 font-semibold'
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className='flex items-center gap-2'>
                        Created
                        {sortBy === 'createdAt' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className='py-4 px-6 font-semibold'>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className='hover:bg-muted/50'>
                      <TableCell className='py-4 px-6'>
                        <div className='font-medium text-base'>
                          {user.firstName} {user.lastName}
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground py-4 px-6'>
                        <div className='text-base'>{user.email}</div>
                      </TableCell>
                      <TableCell className='py-4 px-6'>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                            user.role === 'ROLE_ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </TableCell>
                      <TableCell className='py-4 px-6'>
                        <div className='flex flex-col gap-1'>
                          <span
                            className={`inline-flex items-center text-sm font-medium ${
                              user.isActive ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                user.isActive ? 'bg-green-600' : 'bg-red-600'
                              }`}
                            />
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {user.hasSetPassword ? 'Accepted' : 'Pending'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground py-4 px-6'>
                        <div className='text-base'>
                          {format(user.createdAt, 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className='py-4 px-6'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleStatusToggle(user.id, !user.isActive)
                          }
                          className='h-9'
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination - Fixed at bottom with better spacing */}
        <Card>
          <CardContent className='py-4'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='text-base text-muted-foreground'>
                Showing <span className='font-medium'>{users.length}</span> of{' '}
                <span className='font-medium'>{totalCount}</span> users
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className='cursor-pointer'
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(pageCount, p + 1))
                      }
                      className={
                        currentPage === pageCount
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className='w-full sm:w-[120px] h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10 rows</SelectItem>
                  <SelectItem value='25'>25 rows</SelectItem>
                  <SelectItem value='50'>50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
