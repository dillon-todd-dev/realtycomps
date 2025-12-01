'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useTransition } from 'react';
import { updateConventionalLoanParams } from '@/actions/evaluations';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Evaluation = any; // Replace with your actual type

interface ConventionalFinancingFormProps {
  evaluation: Evaluation;
}

export default function ConventionalFinancingForm({
  evaluation,
}: ConventionalFinancingFormProps) {
  const [isPending, startTransition] = useTransition();

  const conventionalParams = evaluation.conventionalLoanParams;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateConventionalLoanParams(evaluation.id, evaluation.userId, {
          downPayment: formData.get('downPayment') as string,
          loanTerm: Number(formData.get('loanTerm')),
          interestRate: formData.get('interestRate') as string,
          lenderFees: formData.get('lenderFees') as string,
          mortgageInsurance: formData.get('mortgageInsurance') as string,
          monthsOfTaxes: Number(formData.get('monthsOfTaxes')),
        });
        toast.success('Deal terms updated successfully');
      } catch (error) {
        console.error('Failed to update:', error);
        toast.error('Failed to update deal terms');
      }
    });
  }

  return (
    <div className='space-y-6'>
      {/* Loan Parameters Form */}
      <Card>
        <CardHeader>
          <CardTitle>Conventional Loan Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='downPayment'>Down Payment (%)</Label>
                <Input
                  id='downPayment'
                  type='number'
                  step='0.01'
                  defaultValue={conventionalParams?.downPayment || '20'}
                  placeholder='20'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='loanTerm'>Loan Term (years)</Label>
                <Input
                  id='loanTerm'
                  type='number'
                  defaultValue={conventionalParams?.loanTerm || '30'}
                  placeholder='30'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='interestRate'>Interest Rate (%)</Label>
                <Input
                  id='interestRate'
                  type='number'
                  step='0.001'
                  defaultValue={conventionalParams?.interestRate || '5.000'}
                  placeholder='5.000'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lenderFees'>Lender & Title Fees</Label>
                <Input
                  id='lenderFees'
                  type='number'
                  defaultValue={conventionalParams?.lenderFees || '6000'}
                  placeholder='6000'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='monthsOfTaxes'># Months Tax & Insurance</Label>
                <Input
                  id='monthsOfTaxes'
                  type='number'
                  defaultValue={conventionalParams?.monthsOfTaxes || '0'}
                  placeholder='0'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='mortgageInsurance'>
                  Mortgage Insurance (Annual)
                </Label>
                <Input
                  id='mortgageInsurance'
                  type='number'
                  defaultValue={conventionalParams?.mortgageInsurance || '0'}
                  placeholder='0'
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Update Conventional Financing'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Gains And Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>Equity Capture</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>
                    Annual Cash Flow
                  </TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>
                    Return On Equity Capture
                  </TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>
                    Cash On Cash Return
                  </TableCell>
                  <TableCell className='text-right font-bold'>$0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cash Out Of Pocket</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>Down Payment</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Closing Costs</TableCell>
                  <TableCell className='text-right'>-$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>
                    Prepaid Expenses
                  </TableCell>
                  <TableCell className='text-right'>-$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Repairs</TableCell>
                  <TableCell className='text-right'>-$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-bold'>TOTAL</TableCell>
                  <TableCell className='text-right font-bold'>$0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>Monthly Rent</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Note Payment</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Property Tax</TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Property Ins.</TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Mortgage Ins.</TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>HOA</TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Misc. Monthly</TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>TOTAL</TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
