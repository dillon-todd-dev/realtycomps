import { getProperty } from '@/actions/properties';
import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';
import PropertyDetailView from '@/components/property/property-detail-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvaluationsByProperty } from '@/actions/evaluations';

interface PropertyDetailPageProps {
  params: {
    propertyId: string;
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const user = await requireUser();
  const { propertyId } = await params;
  const property = await getProperty(propertyId, user.id);
  const evaluations = await getEvaluationsByProperty(propertyId, user.id);

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
              <Link href={`/dashboard/properties/${propertyId}/edit`}>
                <Edit className='h-4 w-4 mr-2' />
                Edit Property
              </Link>
            </Button>
          </div>
        }
      />

      <div className='p-6'>
        <PropertyDetailView property={property} evaluations={evaluations} />
      </div>
    </>
  );
}
