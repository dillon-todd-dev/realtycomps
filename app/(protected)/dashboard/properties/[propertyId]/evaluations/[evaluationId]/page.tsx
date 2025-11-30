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
    evaluationId: string;
  };
}

export default async function EvaluationDetailPage({
  params,
}: EvaluationDetailPageProps) {
  const user = await requireUser();
  const { evaluationId } = await params;
  const evaluation = await getEvaluation(evaluationId, user.id);

  if (!evaluation) {
    console.log('Unable to get evaluation');
    notFound();
  }

  return <EvaluationDetailView evaluation={evaluation} />;
}
