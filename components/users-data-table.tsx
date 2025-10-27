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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

interface UsersDataTableProps {
  initialData: {
    users: User[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
}

export default function UsersDataTable({ initialData }: UsersDataTableProps) {
  const [users, setUsers] = useState(initialData.users);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [pageCount, setPageCount] = useState(initialData.pageCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'ROLE_USER' | 'ROLE_ADMIN'
  >('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search users...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) =>
            setRoleFilter(value as 'all' | 'ROLE_USER' | 'ROLE_ADMIN')
          }
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='All roles' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All roles</SelectItem>
            <SelectItem value='ROLE_USER'>User</SelectItem>
            <SelectItem value='ROLE_ADMIN'>Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pageSize.toString()}
          onValueChange={(v) => setPageSize(Number(v))}
        >
          <SelectTrigger className='w-[100px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10 rows</SelectItem>
            <SelectItem value='25'>25 rows</SelectItem>
            <SelectItem value='50'>50 rows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className='rounded-md border relative'>
        {isPending && (
          <div className='absolute inset-0 bg-background/50 flex items-center justify-center z-10'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('name')}
              >
                <div className='flex items-center gap-1'>
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
                className='cursor-pointer'
                onClick={() => handleSort('email')}
              >
                <div className='flex items-center gap-1'>
                  Email
                  {sortBy === 'email' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    ))}
                </div>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('createdAt')}
              >
                <div className='flex items-center gap-1'>
                  Created
                  {sortBy === 'createdAt' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    ))}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className='font-medium'>
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {user.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.role === 'ROLE_ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1'>
                    <span
                      className={`inline-flex text-xs ${
                        user.isActive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {user.isActive ? '● Active' : '● Inactive'}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {user.hasSetPassword ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(user.createdAt, 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleStatusToggle(user.id, !user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Showing {users.length} of {totalCount} users
        </p>

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

            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className='cursor-pointer'
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

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
      </div>
    </div>
  );
}
