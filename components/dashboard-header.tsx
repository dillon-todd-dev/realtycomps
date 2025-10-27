'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  title?: string;
}

export default function DashboardHeader({
  title = 'Dashboard',
}: DashboardHeaderProps) {
  return (
    <header className='hidden lg:flex items-center justify-between border-b bg-background px-6 py-4'>
      <div>
        <h1 className='text-2xl font-semibold text-foreground'>{title}</h1>
      </div>

      <div className='flex items-center gap-4'>
        {/* Search */}
        <div className='relative w-64'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search...' className='pl-10' />
        </div>

        {/* Notifications */}
        <Button variant='ghost' size='sm'>
          <Bell className='h-4 w-4' />
        </Button>
      </div>
    </header>
  );
}
