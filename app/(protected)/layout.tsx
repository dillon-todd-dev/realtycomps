import DashboardHeader from '@/components/dashboard-header';
import { requireUser } from '@/lib/session';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <main className='flex min-h-screen w-full'>
      <div className='bg-light-300 xs:p-10 flex w-[calc(100%-264px)] flex-1 flex-col p-5'>
        <DashboardHeader firstName={user.firstName} lastName={user.lastName} />
        {children}
      </div>
    </main>
  );
}
