'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  LogOut,
  ChevronDown,
  Menu,
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { logout } from '@/actions/auth';

interface DashboardSidebarProps {
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
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

function SidebarContent({
  firstName,
  lastName,
  role,
  avatarUrl,
  onNavigate,
}: DashboardSidebarProps & { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

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

  const handleNavClick = () => {
    onNavigate?.();
  };

  return (
    <div className='flex h-full flex-col bg-background'>
      {/* Logo/Brand */}
      <div className='flex h-14 items-center border-b px-4'>
        <Link
          href='/dashboard'
          className='flex items-center font-semibold text-foreground'
        >
          <span className='text-lg'>RealtyComps</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 p-3'>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className='h-4 w-4' />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className='border-t p-3'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='w-full justify-start gap-3 px-3 py-2 h-auto'
            >
              <Avatar className='h-8 w-8'>
                <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
                <AvatarFallback className='text-xs font-medium'>
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>

              <div className='flex flex-col items-start text-left flex-1 min-w-0'>
                <span className='text-sm font-medium truncate'>
                  {firstName} {lastName}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </span>
              </div>

              <ChevronDown className='h-4 w-4 flex-shrink-0' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
      </div>
    </div>
  );
}

export default function DashboardSidebar(props: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='lg:hidden fixed top-3 left-4 z-40'
          >
            <Menu className='h-4 w-4' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='p-0 w-64'>
          <SidebarContent {...props} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className='hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background'>
        <SidebarContent {...props} />
      </aside>
    </>
  );
}
