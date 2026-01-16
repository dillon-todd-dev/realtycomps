import { getProperty } from '@/actions/properties';
import { requireUser } from '@/lib/session';
import PropertyDetailView from '@/components/property/property-detail-view';
import { notFound } from 'next/navigation';
import { getEvaluationsByProperty } from '@/actions/evaluations';
import { getPropertyDocuments } from '@/actions/documents';

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

  const [property, evaluations, documents] = await Promise.all([
    getProperty(propertyId, user.id),
    getEvaluationsByProperty(propertyId, user.id),
    getPropertyDocuments(propertyId),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <PropertyDetailView
      property={property}
      evaluations={evaluations}
      documents={documents}
    />
  );
}
