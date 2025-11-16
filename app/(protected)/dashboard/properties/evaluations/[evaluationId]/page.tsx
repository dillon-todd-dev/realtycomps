import { getEvaluation } from '@/actions/evaluations';
import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';
import EvaluationDetailView from '@/components/evaluation/evaluation-detail-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EvaluationDetailPageProps {
  params: {
    propertyId: string;
    evaluationId: string;
  };
}

export default async function EvaluationDetailPage({
  params,
}: EvaluationDetailPageProps) {
  const user = await requireUser();
  const { propertyId, evaluationId } = await params;
  const evaluation = await getEvaluation(evaluationId, user.id);

  if (!evaluation) {
    console.log('Unable to get evaluation');
    notFound();
  }

  return (
    <>
      <PageHeader
        title={'Investment Evaluation'}
        description={`Analysis for ${
          evaluation.property.address || 'property'
        }`}
        action={
          <Button variant='outline' asChild>
            <Link href={`/dashboard/properties/${propertyId}`}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Property
            </Link>
          </Button>
        }
      />

      <div className='p-6'>
        <EvaluationDetailView evaluation={evaluation} />
      </div>
    </>
  );
}
