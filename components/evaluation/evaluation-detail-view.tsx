'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import DealTermsForm from '@/components/evaluation/forms/deal-terms-form';
import ConventionalFinancingForm from '@/components/evaluation/forms/conventional-financing-form';
import HardMoneyFinancingForm from '@/components/evaluation/forms/hard-money-financing-form';
import Comparables from '@/components/evaluation/comparables';

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
  // Default to the stored strategy type, or conventional if not set
  const [selectedFinancing, setSelectedFinancing] = useState<
    'conventional' | 'hard_money'
  >(evaluation.strategyType || 'conventional');

  return (
    <div className='space-y-6'>
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
          <Tabs
            value={selectedFinancing}
            onValueChange={(value) =>
              setSelectedFinancing(value as 'conventional' | 'hard_money')
            }
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='conventional'>
                Conventional Financing
              </TabsTrigger>
              <TabsTrigger value='hard_money'>
                Hard Money & Refinance
              </TabsTrigger>
            </TabsList>

            <TabsContent value='conventional' className='mt-6'>
              <ConventionalFinancingForm evaluation={evaluation} />
            </TabsContent>

            <TabsContent value='hard_money' className='mt-6'>
              <HardMoneyFinancingForm evaluation={evaluation} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
