'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import { updateConventionalLoanParams } from '@/actions/evaluations';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { formatDollarAmount, monthlyLoanAmount } from '@/lib/utils';

type Evaluation = any; // Replace with your actual type

interface ConventionalFinancingFormProps {
  evaluation: Evaluation;
}

export default function ConventionalFinancingForm({
  evaluation,
}: ConventionalFinancingFormProps) {
  const loanParams = evaluation.conventionalLoanParams;
  const dealTerms = evaluation.dealTerms;

  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    downPayment: loanParams.downPayment,
    loanTerm: String(loanParams.loanTerm),
    interestRate: loanParams.interestRate,
    lenderFees: loanParams.lenderFees,
    monthsOfTaxes: String(loanParams.monthsOfTaxes),
    mortgageInsurance: loanParams.mortgageInsurance,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    console.log(formData);
    startTransition(async () => {
      try {
        await updateConventionalLoanParams(evaluation.id, evaluation.userId, {
          downPayment: formData.downPayment,
          loanTerm: Number(formData.loanTerm),
          interestRate: formData.interestRate,
          lenderFees: formData.lenderFees,
          mortgageInsurance: formData.monthsOfTaxes,
          monthsOfTaxes: Number(formData.mortgageInsurance),
        });
        toast.success('Deal terms updated successfully');
      } catch (error) {
        console.error('Failed to update:', error);
        toast.error('Failed to update deal terms');
      }
    });
  }

  const downPayment: number = useMemo(() => {
    const purchasePrice = Number(evaluation?.purchasePrice);
    const downPaymentPercent = Number(evaluation?.downPayment) / 100;
    return purchasePrice * downPaymentPercent;
  }, [evaluation?.purchasePrice, loanParams.downPayment]);

  const closingCosts: number = useMemo(() => {
    const lenderFees = Number(evaluation?.lenderFees);
    const survey = Number(evaluation?.survey);
    const appraisal = Number(evaluation?.appraisal);
    const inspection = Number(evaluation?.inspection);
    return lenderFees + survey + appraisal + inspection;
  }, [
    loanParams?.lenderFees,
    evaluation?.survey,
    evaluation?.appraisal,
    evaluation?.inspection,
  ]);

  const cashOutOfPocketTotal: number = useMemo(() => {
    const repairs = Number(evaluation?.repairs);
    return downPayment + closingCosts + repairs;
  }, [downPayment, closingCosts, evaluation?.repairs]);

  const notePayment: number = useMemo(() => {
    const purchasePrice = Number(evaluation?.purchasePrice);
    const downPaymentPercent = Number(evaluation?.downPayment) / 100;
    const downPayment = purchasePrice * downPaymentPercent;
    const loanAmount = purchasePrice - downPayment;
    const monthlyInterestRate = Number(evaluation?.interestRate) / 100 / 12;
    const loanTermMonths = Number(evaluation?.loanTerm) * 12;
    return monthlyLoanAmount(loanTermMonths, monthlyInterestRate, loanAmount);
  }, [
    evaluation?.purchasePrice,
    loanParams?.downPayment,
    loanParams?.interestRate,
    loanParams?.loanTerm,
  ]);

  const propertyTax: number = useMemo(() => {
    const annualPropertyTax = Number(evaluation?.propertyTax);
    return annualPropertyTax / 12;
  }, [evaluation?.propertyTax]);

  const propertyInsurance: number = useMemo(() => {
    const annualInsurance = Number(evaluation?.insurance);
    return annualInsurance / 12;
  }, [evaluation?.insurance]);

  const mortgageInsurance: number = useMemo(() => {
    const annualInsurance = Number(evaluation?.refiMortgageInsurance);
    return annualInsurance / 12;
  }, [evaluation?.refiMortgageInsurance]);

  const hoa: number = useMemo(() => {
    const annualHoa = Number(evaluation?.hoa);
    return annualHoa / 12;
  }, [evaluation?.hoa]);

  const cashflowTotal: number = useMemo(() => {
    const rent = Number(evaluation?.rent);
    const misc = Number(evaluation?.miscellaneous);
    return (
      rent -
      notePayment -
      propertyTax -
      propertyInsurance -
      hoa -
      mortgageInsurance -
      misc
    );
  }, [
    evaluation?.rent,
    propertyTax,
    propertyInsurance,
    mortgageInsurance,
    hoa,
    evaluation?.miscellaneous,
    notePayment,
  ]);

  return (
    <div className='space-y-6'>
      {/* Loan Parameters Form */}
      <Card>
        <CardHeader>
          <CardTitle>Conventional Loan Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='downPayment'>Down Payment (%)</Label>
                <Input
                  id='downPayment'
                  name='downPayment'
                  type='number'
                  step='0.01'
                  value={formData.downPayment}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      downPayment: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='loanTerm'>Loan Term (years)</Label>
                <Input
                  id='loanTerm'
                  name='loanTerm'
                  type='number'
                  value={formData.loanTerm}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      loanTerm: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='interestRate'>Interest Rate (%)</Label>
                <Input
                  id='interestRate'
                  name='interestRate'
                  type='number'
                  step='0.001'
                  value={formData.interestRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      interestRate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lenderFees'>Lender & Title Fees</Label>
                <Input
                  id='lenderFees'
                  name='lenderFees'
                  type='number'
                  value={formData.lenderFees}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lenderFees: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='monthsOfTaxes'># Months Tax & Insurance</Label>
                <Input
                  id='monthsOfTaxes'
                  name='monthsOfTaxes'
                  type='number'
                  value={formData.monthsOfTaxes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthsOfTaxes: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='mortgageInsurance'>
                  Mortgage Insurance (Annual)
                </Label>
                <Input
                  id='mortgageInsurance'
                  name='mortgageInsurance'
                  type='number'
                  value={formData.mortgageInsurance}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mortgageInsurance: e.target.value,
                    }))
                  }
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
                  <TableCell className='text-right'>
                    -{formatDollarAmount(evaluation.repairs)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-bold'>TOTAL</TableCell>
                  <TableCell className='text-right font-bold'>
                    {formatDollarAmount(cashOutOfPocketTotal)}
                  </TableCell>
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
                  <TableCell className='text-right'>
                    {formatDollarAmount(Number(evaluation?.rent))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Note Payment</TableCell>
                  <TableCell className='text-right'>
                    -{formatDollarAmount(notePayment)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Property Tax</TableCell>
                  <TableCell className='text-right'>
                    -{formatDollarAmount(propertyTax)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Property Ins.</TableCell>
                  <TableCell className='text-right'>
                    -{formatDollarAmount(propertyInsurance)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Mortgage Ins.</TableCell>
                  <TableCell className='text-right'>
                    -{formatDollarAmount(mortgageInsurance)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>HOA</TableCell>
                  <TableCell className='text-right'>
                    -{formatDollarAmount(hoa)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Misc. Monthly</TableCell>
                  <TableCell className='text-right'>
                    -{formatDollarAmount(Number(evaluation.miscallaneous))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>TOTAL</TableCell>
                  <TableCell className='text-right'>
                    {formatDollarAmount(cashflowTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
