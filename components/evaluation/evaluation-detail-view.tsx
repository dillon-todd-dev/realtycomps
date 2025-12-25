'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DealTermsForm from '@/components/evaluation/forms/deal-terms-form';
import HardMoneyFinancingForm from '@/components/evaluation/forms/hard-money-financing-form';
import Comparables from '@/components/evaluation/comparables';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { EvaluationWithRelations } from '@/lib/types';

interface EvaluationDetailViewProps {
  evaluation: EvaluationWithRelations;
}

export default function EvaluationDetailView({
  evaluation,
}: EvaluationDetailViewProps) {
  const saleComps = evaluation.comparables.filter(
    (comp) => comp.type === 'SALE',
  );
  const rentComps = evaluation.comparables.filter(
    (comp) => comp.type === 'RENT',
  );
  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  return (
    <>
      <div className='flex h-14 items-center justify-between border-b bg-background px-6 sticky top-0 z-10'>
        <div className='flex flex-col justify-center'>
          <h1 className='text-lg font-semibold text-foreground'>
            Investment Evaluation
          </h1>
          <p className='text-xs text-muted-foreground'>{`Analysis for ${
            evaluation.property.address || 'property'
          }`}</p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportClick}
            className='shrink-0'
            title='Export to PDF'
          >
            <Download className='h-4 w-4 md:mr-2' />
            <span className='hidden md:inline'>Export PDF</span>
          </Button>
          <Button variant='outline' asChild>
            <Link href={`/dashboard/properties/${evaluation.property.id}`}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Property
            </Link>
          </Button>
        </div>
      </div>
      <div className='space-y-6 p-6'>
        {/* Property Summary Card */}
        <Card>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='text-2xl'>
                  {evaluation.property.address || 'Property Address'}
                </CardTitle>
                {(evaluation.property.city || evaluation.property.state) && (
                  <p className='text-muted-foreground mt-1'>
                    {evaluation.property.city}
                    {evaluation.property.city &&
                      evaluation.property.state &&
                      ', '}
                    {evaluation.property.state} {evaluation.property.postalCode}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Comparables
          evaluationId={evaluation.id}
          propertyId={evaluation.propertyId}
          initialComparables={saleComps || []}
          propertyAddress={evaluation.property.address}
          title='Sale Comps'
          compType='SALE'
        />

        <Comparables
          evaluationId={evaluation.id}
          propertyId={evaluation.propertyId}
          initialComparables={rentComps || []}
          propertyAddress={evaluation.property.address}
          title='Rent Comps'
          compType='RENT'
        />

        <DealTermsForm evaluation={evaluation} />

        <Card>
          <CardHeader>
            <CardTitle>Financing Analysis</CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Choose your financing strategy to see detailed calculations
            </p>
          </CardHeader>
          <CardContent>
            <HardMoneyFinancingForm evaluation={evaluation} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
