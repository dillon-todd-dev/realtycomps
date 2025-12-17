import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';

export default async function DashboardHomePage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title='Dashboard'
        description="Welcome back! Here's what's happening with your properties."
      />

      <div className='p-6'>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {/* Your dashboard cards/widgets here */}
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <h3 className='text-2xl font-bold'>42</h3>
            <p className='text-sm text-muted-foreground'>Total Properties</p>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <h3 className='text-2xl font-bold'>12</h3>
            <p className='text-sm text-muted-foreground'>Active Users</p>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <h3 className='text-2xl font-bold'>8</h3>
            <p className='text-sm text-muted-foreground'>Investors</p>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <h3 className='text-2xl font-bold'>$2.4M</h3>
            <p className='text-sm text-muted-foreground'>Total Value</p>
          </div>
        </div>
      </div>
    </>
  );
}
