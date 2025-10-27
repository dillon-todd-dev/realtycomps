'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/lib/types';
import { logout } from '@/actions/auth';

interface DashboardHeaderProps {
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

export default function DashboardHeader({
  firstName,
  lastName,
  role,
  avatarUrl,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Home',
      icon: Home,
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      href: '/dashboard/properties',
      label: 'Properties',
      icon: Building2,
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
      roles: ['ROLE_ADMIN'],
    },
    {
      href: '/dashboard/investors',
      label: 'Investors',
      icon: UserCheck,
      roles: ['ROLE_ADMIN'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActivePath = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className='mb-5 pb-5 flex flex-col items-start justify-between gap-5 sm:mb-10 lg:flex-row lg:items-center border-b-2'>
      {/* Left side - User info and navigation */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8'>
        {/* Navigation */}
        <nav className='flex flex-wrap gap-1'>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href);

            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                size='sm'
                asChild
                className='gap-2'
              >
                <Link href={item.href}>
                  <Icon className='h-4 w-4' />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Right side - User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='gap-2'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback>
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>

            <span className='hidden sm:block'>
              {firstName} {lastName}
            </span>

            <ChevronDown className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {firstName} {lastName}
              </p>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}
                  className='text-xs'
                >
                  {role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className='gap-2 text-destructive focus:text-destructive'
          >
            <LogOut className='h-4 w-4' />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
