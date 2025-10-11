import DashboardHeader from '@/components/dashboard-header';
import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session?.userId) {
    redirect('/login');
  }

  return (
    <main className='flex min-h-screen w-full'>
      <div className='bg-light-300 xs:p-10 flex w-[calc(100%-264px)] flex-1 flex-col p-5'>
        <DashboardHeader
          firstName={session.firstName}
          lastName={session.lastName}
        />
        {children}
      </div>
    </main>
  );
}
