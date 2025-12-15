'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import {
  updateHardMoneyLoanParams,
  updateRefinanceLoanParams,
} from '@/actions/evaluations';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { formatDollarAmount, monthlyLoanAmount } from '@/lib/utils';
import { DollarInput } from '@/components/dollar-input';
import { SelectInput } from '@/components/select-input';

type Evaluation = any; // Replace with your actual type

interface HardMoneyFinancingFormProps {
  evaluation: Evaluation;
}

export default function HardMoneyFinancingForm({
  evaluation,
}: HardMoneyFinancingFormProps) {
  const hardMoneyParams = evaluation.hardMoneyLoanParams;
  const refinanceParams = evaluation.refinanceLoanParams;

  console.log(evaluation);

  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    hardLoanToValue: hardMoneyParams.loanToValue,
    hardLenderFees: hardMoneyParams.lenderFees,
    hardInterestRate: hardMoneyParams.interestRate,
    rollInLenderFees: hardMoneyParams.rollInLenderFees,
    weeksUntilLeased: String(hardMoneyParams.weeksUntilLeased),
    refiLoanToValue: refinanceParams.loanToValue,
    refiLoanTerm: String(refinanceParams.loanTerm),
    refiInterestRate: refinanceParams.interestRate,
    refiLenderFees: refinanceParams.lenderFees,
    refiMortgageInsurance: refinanceParams.mortgageInsurance,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateHardMoneyLoanParams(evaluation.id, evaluation.userId, {
          loanToValue: formData.hardLoanToValue,
          lenderFees: formData.hardLenderFees,
          interestRate: formData.hardInterestRate,
          rollInLenderFees: Boolean(formData.rollInLenderFees),
          weeksUntilLeased: Number(formData.weeksUntilLeased),
        });
        await updateRefinanceLoanParams(evaluation.id, evaluation.userId, {
          loanToValue: formData.refiLoanToValue,
          loanTerm: Number(formData.refiLoanTerm),
          interestRate: formData.refiInterestRate,
          lenderFees: formData.refiLenderFees,
          mortgageInsurance: formData.refiMortgageInsurance,
        });
        toast.success('Deal terms updated successfully');
      } catch (error) {
        console.error('Failed to update:', error);
        toast.error('Failed to update deal terms');
      }
    });
  }

  const hardCashToClose: number = useMemo(() => {
    const ltv = Number(hardMoneyParams?.loanToValue);
    const arv = Number(evaluation?.estimatedSalePrice);
    const maxLoanAmount = (ltv / 100) * arv;
    const purchasePrice = Number(evaluation?.purchasePrice);
    const repairs = Number(evaluation?.repairs);
    return Math.abs(purchasePrice - (maxLoanAmount - repairs));
  }, [
    hardMoneyParams?.loanToValue,
    evaluation?.estimatedSalePrice,
    evaluation?.purchasePrice,
    evaluation?.repairs,
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
    const annualInsurance = Number(refinanceParams?.mortgageInsurance);
    return annualInsurance / 12;
  }, [refinanceParams?.mortgageInsurance]);

  const hoa: number = useMemo(() => {
    const annualHoa = Number(evaluation?.hoa);
    return annualHoa / 12;
  }, [evaluation?.hoa]);

  const notePayment: number = useMemo(() => {
    const estimatedSalePrice = Number(evaluation?.estimatedSalePrice);
    const loanToValue = Number(refinanceParams?.loanToValue) / 100;
    const loanAmount = estimatedSalePrice * loanToValue;
    const monthlyInterestRate =
      Number(refinanceParams?.interestRate) / 100 / 12;
    const loanTermMonths = Number(refinanceParams?.loanTerm) * 12;
    return monthlyLoanAmount(loanTermMonths, monthlyInterestRate, loanAmount);
  }, [
    evaluation?.estimatedSalePrice,
    refinanceParams?.loanToValue,
    refinanceParams?.interestRate,
    refinanceParams?.loanTerm,
  ]);

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
    notePayment,
    evaluation?.miscellaneous,
  ]);

  const hardClosingCosts: number = useMemo(() => {
    const hardLenderFees = Number(hardMoneyParams?.lenderFees);
    const refiLenderFees = Number(refinanceParams?.lenderFees);
    const appraisal = Number(evaluation?.appraisal);
    const survey = Number(evaluation?.survey);
    const inspection = Number(evaluation?.inspection);
    return hardLenderFees + refiLenderFees + appraisal + survey + inspection;
  }, [
    hardMoneyParams?.lenderFees,
    refinanceParams?.lenderFees,
    evaluation?.appraisal,
    evaluation?.survey,
    evaluation?.inspection,
  ]);

  const hardCashOutOfPocket: number = useMemo(() => {
    return hardCashToClose + hardClosingCosts;
  }, [hardCashToClose, hardClosingCosts]);

  const equityCapture: number = useMemo(() => {
    const purchasePrice = Number(evaluation?.purchasePrice);
    const salePrice = Number(evaluation.estimatedSalePrice);
    return salePrice - (purchasePrice + hardCashOutOfPocket);
  }, [
    hardCashOutOfPocket,
    evaluation?.estimatedSalePrice,
    evaluation?.purchasePrice,
  ]);

  const returnOnEquity: number = useMemo(() => {
    const annualCashFlow = cashflowTotal * 12;
    return (annualCashFlow / equityCapture) * 100;
  }, [cashflowTotal, equityCapture]);

  const cashOnCashReturn: number = useMemo(() => {
    const annualCashFlow = cashflowTotal * 12;
    return (annualCashFlow / hardCashOutOfPocket) * 100;
  }, [cashflowTotal, hardCashOutOfPocket]);

  return (
    <div className='space-y-6'>
      {/* Loan Parameters Form */}
      <Card>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Hard Money Loan Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Hard Money Loan</h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='hardLoanToValue'>Loan to Value (%)</Label>
                    <SelectInput
                      id='hardLoanToValue'
                      type='number'
                      step='0.01'
                      value={formData.hardLoanToValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hardLoanToValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='hardLenderFees'>Lender & Title Fees</Label>
                    <DollarInput
                      id='hardLenderFees'
                      value={formData.hardLenderFees}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hardLenderFees: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='hardInterestRate'>Interest Rate (%)</Label>
                    <SelectInput
                      id='hardInterestRate'
                      type='number'
                      step='0.001'
                      value={formData.hardInterestRate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hardInterestRate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='rollInLenderFees'
                      value={formData.rollInLenderFees}
                    />
                    <Label
                      htmlFor='rollInLenderFees'
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      Roll in Lender Fees?
                    </Label>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='weeksUntilLeased'>Weeks Until Leased</Label>
                    <SelectInput
                      id='weeksUntilLeased'
                      type='number'
                      value={formData.weeksUntilLeased}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weeksUntilLeased: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Refinance Loan Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Refinance Loan</h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='refiLoanToValue'>Loan to Value (%)</Label>
                    <SelectInput
                      id='refiLoanToValue'
                      type='number'
                      step='0.01'
                      value={formData.refiLoanToValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          refiLoanToValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiLoanTerm'>Loan Term (years)</Label>
                    <SelectInput
                      id='refiLoanTerm'
                      type='number'
                      value={formData.refiLoanTerm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          refiLoanTerm: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiInterestRate'>Interest Rate (%)</Label>
                    <SelectInput
                      id='refiInterestRate'
                      type='number'
                      step='0.001'
                      value={formData.refiInterestRate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          refiInterestRate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiLenderFees'>Lender & Title Fees</Label>
                    <DollarInput
                      id='refiLenderFees'
                      value={formData.refiLenderFees}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          refiLenderFees: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiMortgageInsurance'>
                      Mortgage Insurance (Annual)
                    </Label>
                    <DollarInput
                      id='refiMortgageInsurance'
                      type='number'
                      value={formData.refiMortgageInsurance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          refiMortgageInsurance: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
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
                  'Update Hard Money Financing'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-2'>
        <Card>
          <CardHeader>
            <CardTitle>Gains And Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Equity Capture
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {formatDollarAmount(equityCapture)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Annual Cash Flow
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {formatDollarAmount(cashflowTotal * 12)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Return On Equity Capture
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {returnOnEquity.toFixed(1)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Cash On Cash Return
                  </TableCell>
                  <TableCell className='text-right font-bold whitespace-nowrap text-sm'>
                    {cashOnCashReturn.toFixed(1)}%
                  </TableCell>
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
                  <TableCell className='font-medium text-sm'>
                    Hard Cash To Close
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {formatDollarAmount(hardCashToClose)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Closing Costs
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {formatDollarAmount(hardClosingCosts)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>Repairs</TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {formatDollarAmount(Number(evaluation?.repairs))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Lender Reserves
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -$0
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-bold text-sm'>TOTAL</TableCell>
                  <TableCell className='text-right font-bold whitespace-nowrap text-sm'>
                    {formatDollarAmount(hardCashOutOfPocket)}
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
                  <TableCell className='font-medium text-sm'>
                    Monthly Rent
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    {formatDollarAmount(evaluation.rent)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Note Payment
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -{formatDollarAmount(notePayment)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Property Tax
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -{formatDollarAmount(propertyTax)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Property Ins.
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -{formatDollarAmount(propertyInsurance)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Mortgage Ins.
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -{formatDollarAmount(mortgageInsurance)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>HOA</TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -{formatDollarAmount(hoa)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>
                    Misc. Monthly
                  </TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
                    -{formatDollarAmount(Number(evaluation.miscellaneous))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium text-sm'>TOTAL</TableCell>
                  <TableCell className='text-right whitespace-nowrap text-sm'>
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
