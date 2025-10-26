import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/session';

export default async function DashboardPage() {
  await requireUser();

  return (
    <section className='w-full rounded-2xl bg-white p-7'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-xl font-semibold'>Home</h2>
      </div>
      <div>
        <div className='mt-7 w-full overflow-hidden'>
          <Button onClick={logout}>Sign Out</Button>
        </div>
      </div>
    </section>
  );
}
