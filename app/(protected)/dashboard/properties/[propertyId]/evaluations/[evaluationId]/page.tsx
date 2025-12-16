import { getEvaluation } from '@/actions/evaluations';
import { requireUser } from '@/lib/session';
import EvaluationDetailView from '@/components/evaluation/evaluation-detail-view';

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
