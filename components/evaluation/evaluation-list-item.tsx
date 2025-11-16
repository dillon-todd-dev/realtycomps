'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EvaluationListItem } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface EvaluationListItemProps {
  evaluation: EvaluationListItem;
  propertyId: string;
}

export default function EvaluationListItemCard({
  evaluation,
  propertyId,
}: EvaluationListItemProps) {
  return (
    <Link
      href={`/dashboard/properties/${propertyId}/evaluations/${evaluation.id}`}
    >
      <div className='border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-3'>
              {evaluation.strategyType && (
                <Badge variant='outline' className='capitalize'>
                  {evaluation.strategyType.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <div className='text-muted-foreground mb-1'>
                  Cash on Cash ROI
                </div>
                <div className='font-semibold'>
                  {evaluation.cashOnCashROI
                    ? `${parseFloat(evaluation.cashOnCashROI).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>
                  Monthly Cash Flow
                </div>
                <div className='font-semibold'>
                  {evaluation.monthlyCashFlow
                    ? `$${parseFloat(
                        evaluation.monthlyCashFlow
                      ).toLocaleString()}`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>Cap Rate</div>
                <div className='font-semibold'>
                  {evaluation.capRate
                    ? `${parseFloat(evaluation.capRate).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>Total ROI</div>
                <div className='font-semibold'>
                  {evaluation.totalROI
                    ? `${parseFloat(evaluation.totalROI).toFixed(2)}%`
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className='mt-3 text-xs text-muted-foreground'>
              Last updated:{' '}
              {new Date(evaluation.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
