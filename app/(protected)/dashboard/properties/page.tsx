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

  return <PropertiesGrid initialData={initialData} userId={user.id} />;
}
