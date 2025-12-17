'use client';

import { deleteEvaluation } from '@/actions/evaluations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Evaluation } from '@/lib/types';
import { formatDollarAmount } from '@/lib/utils';
import { Trash } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EvaluationListItemProps {
  evaluation: Evaluation;
  propertyId: string;
}

export default function EvaluationListItemCard({
  evaluation,
  propertyId,
}: EvaluationListItemProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteEvaluation(evaluation.id, evaluation.userId);
      toast.success('Evaluation deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete evaluation');
    }
  };

  return (
    <Link
      href={`/dashboard/properties/${propertyId}/evaluations/${evaluation.id}`}
    >
      <div className='border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <div className='text-muted-foreground mb-1'>Equity Capture</div>
                <div className='font-semibold'>
                  {evaluation.equityCapture
                    ? formatDollarAmount(Number(evaluation.equityCapture))
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>
                  Annual Cash Flow
                </div>
                <div className='font-semibold'>
                  {evaluation.annualCashFlow
                    ? formatDollarAmount(Number(evaluation.annualCashFlow))
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>
                  Return On Equity Capture
                </div>
                <div className='font-semibold'>
                  {evaluation.returnOnEquityCapture
                    ? `${parseFloat(evaluation.returnOnEquityCapture).toFixed(
                        2,
                      )}%`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>
                  Cash On Cash Return
                </div>
                <div className='font-semibold'>
                  {evaluation.cashOnCashReturn
                    ? `${parseFloat(evaluation.cashOnCashReturn).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className='mt-3 text-xs text-muted-foreground'>
              Last updated:{' '}
              {new Date(evaluation.updatedAt).toLocaleDateString()}
            </div>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleDelete}
            className='shrink-0'
            title='Delete evaluation'
          >
            <Trash className='h-4 w-4 md:mr-2' />
            <span className='hidden md:inline'>Delete</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
