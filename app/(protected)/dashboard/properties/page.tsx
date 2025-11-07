import { getProperties } from '@/actions/properties';
import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';
import PropertiesGrid from '@/components/properties-grid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { PropertyType } from '@/lib/types';

interface PropertiesPageProps {
  searchParams: {
    page?: string;
    search?: string;
    type?: PropertyType;
  };
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const user = await requireUser();

  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const type = searchParams.type || undefined;

  const initialData = await getProperties({
    page,
    pageSize: 12, // Good for grid layout
    search,
    type,
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
