import DashboardHeader from '@/components/dashboard-header';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className='flex min-h-screen w-full'>
      <div className='bg-light-300 xs:p-10 flex w-[calc(100%-264px)] flex-1 flex-col p-5'>
        <DashboardHeader name={session.user.name} />
        {children}
      </div>
    </main>
  );
}
