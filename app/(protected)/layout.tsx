import DashboardSidebar from '@/components/dashboard-sidebar';
import { requireUser } from '@/lib/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Sidebar */}
      <DashboardSidebar
        firstName={user.firstName}
        lastName={user.lastName}
        role={user.role}
      />

      {/* Main content - no padding since PageHeader handles the layout */}
      <main className='flex-1 lg:ml-64'>{children}</main>
    </div>
  );
}
