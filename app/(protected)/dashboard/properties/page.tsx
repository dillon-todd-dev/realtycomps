import { getProperties } from '@/actions/properties';
import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';
import PropertiesGrid from '@/components/property/properties-grid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface PropertiesPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const user = await requireUser();

  const { page = '1', search = '' } = await searchParams;
  const pageParam = parseInt(page);

  const initialData = await getProperties({
    page: pageParam,
    pageSize: 12, // Good for grid layout
    search,
    userId: user.id,
  });

  return (
    <>
      <PageHeader
        title='Properties'
        description='Manage and view your property portfolio'
        action={
          <Button asChild>
            <Link href='/dashboard/properties/create'>
              <Plus className='h-4 w-4 mr-2' />
              Add Property
            </Link>
          </Button>
        }
      />

      <div className='p-6'>
        <PropertiesGrid initialData={initialData} userId={user.id} />
      </div>
    </>
  );
}
