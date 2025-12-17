'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateDealTerms } from '@/actions/evaluations';
import React, { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DollarInput } from '@/components/dollar-input';
import { EvaluationWithRelations } from '@/lib/types';

interface DealTermsFormProps {
  evaluation: EvaluationWithRelations;
}

export default function DealTermsForm({ evaluation }: DealTermsFormProps) {
  const [formData, setFormData] = useState({
    purchasePrice: evaluation.purchasePrice,
    estimatedSalePrice: evaluation.estimatedSalePrice,
    rent: evaluation.rent,
    repairs: evaluation.repairs,
    insurance: evaluation.insurance,
    propertyTax: evaluation.propertyTax,
    hoa: evaluation.hoa,
    sellerContribution: evaluation.sellerContribution,
    survey: evaluation.survey,
    inspection: evaluation.inspection,
    appraisal: evaluation.appraisal,
    miscellaneous: evaluation.miscellaneous,
  });
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateDealTerms(evaluation.id, evaluation.userId, {
          purchasePrice: formData.purchasePrice,
          estimatedSalePrice: formData.estimatedSalePrice,
          rent: formData.rent,
          repairs: formData.repairs,
          insurance: formData.insurance,
          propertyTax: formData.propertyTax,
          hoa: formData.hoa,
          sellerContribution: formData.sellerContribution,
          survey: formData.survey,
          inspection: formData.inspection,
          appraisal: formData.appraisal,
          miscellaneous: formData.miscellaneous,
        });
        toast.success('Deal terms updated successfully');
      } catch (error) {
        console.error('Failed to update:', error);
        toast.error('Failed to update deal terms');
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Terms, Expenses & Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Pricing Section */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground mb-3'>
              PRICING
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='purchasePrice'>Purchase Price</Label>
                <DollarInput
                  id='purchasePrice'
                  name='purchasePrice'
                  value={formData.purchasePrice ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purchasePrice: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='estimatedSalePrice'>
                  Estimated Sale Price - ARV
                </Label>
                <DollarInput
                  id='estimatedSalePrice'
                  name='estimatedSalePrice'
                  value={formData.estimatedSalePrice ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedSalePrice: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='sellerContribution'>Seller Contribution</Label>
                <DollarInput
                  id='sellerContribution'
                  name='sellerContribution'
                  value={formData.sellerContribution ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sellerContribution: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Income & Expenses Section */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground mb-3'>
              INCOME & OPERATING EXPENSES
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='rent'>Monthly Rent</Label>
                <DollarInput
                  id='rent'
                  name='rent'
                  value={formData.rent ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rent: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='propertyTax'>Property Tax (Annual)</Label>
                <DollarInput
                  id='propertyTax'
                  name='propertyTax'
                  value={formData.propertyTax ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      propertyTax: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='insurance'>Insurance (Annual)</Label>
                <DollarInput
                  id='insurance'
                  name='insurance'
                  value={formData.insurance ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      insurance: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='hoa'>HOA (Annual)</Label>
                <DollarInput
                  id='hoa'
                  name='hoa'
                  value={formData.hoa ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hoa: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='miscellaneous'>Miscellaneous (Monthly)</Label>
                <DollarInput
                  id='miscellaneous'
                  name='miscellaneous'
                  value={formData.miscellaneous ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      miscellaneous: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Repairs & Closing Costs Section */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground mb-3'>
              REPAIRS & CLOSING COSTS
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='repairs'>Repairs & Make-Ready</Label>
                <DollarInput
                  id='repairs'
                  name='repairs'
                  value={formData.repairs ?? ''}
                  placeholder='0.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      repairs: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='survey'>Survey</Label>
                <DollarInput
                  id='survey'
                  name='survey'
                  value={formData.survey ?? ''}
                  placeholder='400.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      survey: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='inspection'>Inspection</Label>
                <DollarInput
                  id='inspection'
                  name='inspection'
                  value={formData.inspection ?? ''}
                  placeholder='400.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inspection: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='appraisal'>Appraisal</Label>
                <DollarInput
                  id='appraisal'
                  name='appraisal'
                  value={formData.appraisal ?? ''}
                  placeholder='400.00'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      appraisal: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className='flex justify-end pt-4 border-t'>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Update Deal Terms'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
