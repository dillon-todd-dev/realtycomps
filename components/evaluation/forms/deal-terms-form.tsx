'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateDealTerms } from '@/actions/evaluations';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DollarInput } from '@/components/dollar-input';

type Evaluation = any; // Replace with your actual type

interface DealTermsFormProps {
  evaluation: Evaluation;
}

export default function DealTermsForm({ evaluation }: DealTermsFormProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateDealTerms(evaluation.id, evaluation.userId, {
          purchasePrice: formData.get('purchasePrice') as string,
          estimatedSalePrice: formData.get('estimatedSalePrice') as string,
          hardAppraisedPrice: formData.get('hardAppraisedPrice') as string,
          rent: formData.get('rent') as string,
          repairs: formData.get('repairs') as string,
          insurance: formData.get('insurance') as string,
          propertyTax: formData.get('propertyTax') as string,
          hoa: formData.get('hoa') as string,
          sellerContribution: formData.get('sellerContribution') as string,
          survey: formData.get('survey') as string,
          inspection: formData.get('inspection') as string,
          appraisal: formData.get('appraisal') as string,
          miscellaneous: formData.get('miscellaneous') as string,
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
        <form action={handleSubmit} className='space-y-6'>
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
                  defaultValue={evaluation.purchasePrice || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='estimatedSalePrice'>Estimated Sale Price</Label>
                <DollarInput
                  id='estimatedSalePrice'
                  name='estimatedSalePrice'
                  defaultValue={evaluation.estimatedSalePrice || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='hardAppraisedPrice'>Hard Appraised Price</Label>
                <DollarInput
                  id='hardAppraisedPrice'
                  name='hardAppraisedPrice'
                  defaultValue={evaluation.hardAppraisedPrice || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='sellerContribution'>Seller Contribution</Label>
                <DollarInput
                  id='sellerContribution'
                  name='sellerContribution'
                  defaultValue={evaluation.sellerContribution || ''}
                  placeholder='0.00'
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
                  defaultValue={evaluation.rent || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='propertyTax'>Property Tax (Annual)</Label>
                <DollarInput
                  id='propertyTax'
                  name='propertyTax'
                  defaultValue={evaluation.propertyTax || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='insurance'>Insurance (Annual)</Label>
                <DollarInput
                  id='insurance'
                  name='insurance'
                  defaultValue={evaluation.insurance || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='hoa'>HOA (Annual)</Label>
                <DollarInput
                  id='hoa'
                  name='hoa'
                  defaultValue={evaluation.hoa || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='miscellaneous'>Miscellaneous (Monthly)</Label>
                <DollarInput
                  id='miscellaneous'
                  name='miscellaneous'
                  defaultValue={evaluation.miscellaneous || ''}
                  placeholder='0.00'
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
                  defaultValue={evaluation.repairs || ''}
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='survey'>Survey</Label>
                <DollarInput
                  id='survey'
                  name='survey'
                  defaultValue={evaluation.survey || '400'}
                  placeholder='400.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='inspection'>Inspection</Label>
                <DollarInput
                  id='inspection'
                  name='inspection'
                  defaultValue={evaluation.inspection || '400'}
                  placeholder='400.00'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='appraisal'>Appraisal</Label>
                <DollarInput
                  id='appraisal'
                  name='appraisal'
                  defaultValue={evaluation.appraisal || '400'}
                  placeholder='400.00'
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
