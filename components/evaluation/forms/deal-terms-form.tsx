'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Evaluation = any; // Replace with your actual type

interface DealTermsFormProps {
  evaluation: Evaluation;
}

export default function DealTermsForm({ evaluation }: DealTermsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Terms, Expenses & Revenue</CardTitle>
        <p className='text-sm text-muted-foreground mt-1'>
          Enter the core financial details for this property
        </p>
      </CardHeader>
      <CardContent>
        <form className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='purchasePrice'>Purchase Price</Label>
              <Input
                id='purchasePrice'
                type='number'
                defaultValue={evaluation.purchasePrice || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='estimatedSalePrice'>Estimated Sale Price</Label>
              <Input
                id='estimatedSalePrice'
                type='number'
                defaultValue={evaluation.estimatedSalePrice || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='hardAppraisedPrice'>Hard Appraised Price</Label>
              <Input
                id='hardAppraisedPrice'
                type='number'
                defaultValue={evaluation.hardAppraisedPrice || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='rent'>Monthly Rent</Label>
              <Input
                id='rent'
                type='number'
                defaultValue={evaluation.rent || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='repairs'>Repairs & Make-Ready</Label>
              <Input
                id='repairs'
                type='number'
                defaultValue={evaluation.repairs || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='insurance'>Insurance (Annual)</Label>
              <Input
                id='insurance'
                type='number'
                defaultValue={evaluation.insurance || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='propertyTax'>Property Tax (Annual)</Label>
              <Input
                id='propertyTax'
                type='number'
                defaultValue={evaluation.propertyTax || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='hoa'>HOA (Annual)</Label>
              <Input
                id='hoa'
                type='number'
                defaultValue={evaluation.hoa || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='sellerContribution'>Seller Contribution</Label>
              <Input
                id='sellerContribution'
                type='number'
                defaultValue={evaluation.sellerContribution || ''}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='survey'>Survey</Label>
              <Input
                id='survey'
                type='number'
                defaultValue={evaluation.survey || '400'}
                placeholder='400'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='inspection'>Inspection</Label>
              <Input
                id='inspection'
                type='number'
                defaultValue={evaluation.inspection || '400'}
                placeholder='400'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='appraisal'>Appraisal</Label>
              <Input
                id='appraisal'
                type='number'
                defaultValue={evaluation.appraisal || '400'}
                placeholder='400'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='miscellaneous'>Miscellaneous (Monthly)</Label>
              <Input
                id='miscellaneous'
                type='number'
                defaultValue={evaluation.miscellaneous || ''}
                placeholder='0'
              />
            </div>
          </div>

          <div className='flex justify-end'>
            <Button type='submit'>Update Deal Terms</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
