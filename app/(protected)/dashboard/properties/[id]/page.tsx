import { getProperty } from '@/actions/properties';
import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';
import PropertyDetailView from '@/components/property-detail-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyWithImages } from '@/lib/types';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

async function fetchProperty(
  propertyId: string,
  userId: string
): Promise<PropertyWithImages | null> {
  try {
    return getProperty(propertyId, userId);
  } catch (err) {
    return null;
  }
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const user = await requireUser();

  const property = await getProperty(params.id, user.id);

  if (!property) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title='Property Details'
        description={property.address || ''}
        action={
          <div className='flex gap-2'>
            <Button variant='outline' asChild>
              <Link href='/dashboard/properties'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Properties
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/properties/${params.id}/edit`}>
                <Edit className='h-4 w-4 mr-2' />
                Edit Property
              </Link>
            </Button>
          </div>
        }
      />

      <div className='p-6'>
        <PropertyDetailView property={property} />
      </div>
    </>
  );
}
