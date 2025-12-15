'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DealTermsForm from '@/components/evaluation/forms/deal-terms-form';
import HardMoneyFinancingForm from '@/components/evaluation/forms/hard-money-financing-form';
import Comparables from '@/components/evaluation/comparables';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

// This type should match your actual evaluation type from the database
type Evaluation = {
  id: string;
  propertyId: string;
  name: string | null;
  strategyType?: 'conventional' | 'hard_money' | null;

  // Property info (joined)
  property: {
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  };

  // Deal terms
  estimatedSalePrice: string | null;
  purchasePrice: string | null;
  hardAppraisedPrice: string | null;
  sellerContribution: string | null;
  repairs: string | null;
  insurance: string | null;
  survey: string | null;
  inspection: string | null;
  appraisal: string | null;
  miscellaneous: string | null;
  rent: string | null;
  hoa: string | null;
  propertyTax: string | null;

  // Conventional loan params (if exists)
  conventionalLoanParams?: {
    downPayment: string | null;
    loanTerm: number | null;
    interestRate: string | null;
    lenderFees: string | null;
    mortgageInsurance: string | null;
    monthsOfTaxes: number | null;
  } | null;

  // Hard money loan params (if exists)
  hardMoneyLoanParams?: {
    loanToValue: string | null;
    lenderFees: string | null;
    interestRate: string | null;
    monthsToRefi: number | null;
    rollInLenderFees: boolean | null;
    weeksUntilLeased: number | null;
  } | null;

  // Refinance loan params (if exists)
  refinanceLoanParams?: {
    loanToValue: string | null;
    loanTerm: number | null;
    interestRate: string | null;
    lenderFees: string | null;
    monthsOfTaxes: number | null;
    mortgageInsurance: string | null;
  } | null;

  createdAt: Date;
  updatedAt: Date;
};

interface EvaluationDetailViewProps {
  evaluation: any;
}

export default function EvaluationDetailView({
  evaluation,
}: EvaluationDetailViewProps) {
  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement PDF export functionality here
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
              {evaluation.strategyType && (
                <Badge variant='outline' className='capitalize'>
                  {evaluation.strategyType.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <Comparables
          evaluationId={evaluation.id}
          initialComparables={evaluation.comparables || []}
          propertyAddress={evaluation.property.address}
        />

        {/* Deal Terms - Always visible */}
        <DealTermsForm evaluation={evaluation} />

        {/* Financing Type Selector */}
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
