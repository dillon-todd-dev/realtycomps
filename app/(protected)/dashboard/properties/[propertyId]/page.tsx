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

  return <PropertyDetailView property={property} evaluations={evaluations} />;
}
