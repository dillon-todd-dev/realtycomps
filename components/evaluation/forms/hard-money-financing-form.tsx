'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

type Evaluation = any; // Replace with your actual type

interface HardMoneyFinancingFormProps {
  evaluation: Evaluation;
}

export default function HardMoneyFinancingForm({
  evaluation,
}: HardMoneyFinancingFormProps) {
  const hardMoneyParams = evaluation.hardMoneyLoanParams;
  const refinanceParams = evaluation.refinanceLoanParams;

  return (
    <div className='space-y-6'>
      {/* Loan Parameters Form */}
      <Card>
        <CardContent className='pt-6'>
          <form className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Hard Money Loan Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Hard Money Loan</h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='hardLoanToValue'>Loan to Value (%)</Label>
                    <Input
                      id='hardLoanToValue'
                      type='number'
                      step='0.01'
                      defaultValue={hardMoneyParams?.loanToValue || '70'}
                      placeholder='70'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='hardLenderFees'>Lender & Title Fees</Label>
                    <Input
                      id='hardLenderFees'
                      type='number'
                      defaultValue={hardMoneyParams?.lenderFees || '10000'}
                      placeholder='10000'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='hardInterestRate'>Interest Rate (%)</Label>
                    <Input
                      id='hardInterestRate'
                      type='number'
                      step='0.001'
                      defaultValue={hardMoneyParams?.interestRate || '14.000'}
                      placeholder='14.000'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='monthsToRefi'># Months to Refi</Label>
                    <Input
                      id='monthsToRefi'
                      type='number'
                      defaultValue={hardMoneyParams?.monthsToRefi || '3'}
                      placeholder='3'
                    />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='rollInLenderFees'
                      defaultChecked={hardMoneyParams?.rollInLenderFees ?? true}
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
                    <Input
                      id='weeksUntilLeased'
                      type='number'
                      defaultValue={hardMoneyParams?.weeksUntilLeased || '8'}
                      placeholder='8'
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
                    <Input
                      id='refiLoanToValue'
                      type='number'
                      step='0.01'
                      defaultValue={refinanceParams?.loanToValue || '75'}
                      placeholder='75'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiLoanTerm'>Loan Term (years)</Label>
                    <Input
                      id='refiLoanTerm'
                      type='number'
                      defaultValue={refinanceParams?.loanTerm || '30'}
                      placeholder='30'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiInterestRate'>Interest Rate (%)</Label>
                    <Input
                      id='refiInterestRate'
                      type='number'
                      step='0.001'
                      defaultValue={refinanceParams?.interestRate || '5.000'}
                      placeholder='5.000'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiLenderFees'>Lender & Title Fees</Label>
                    <Input
                      id='refiLenderFees'
                      type='number'
                      defaultValue={refinanceParams?.lenderFees || '5000'}
                      placeholder='5000'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiMonthsOfTaxes'>
                      # Months Tax & Insurance
                    </Label>
                    <Input
                      id='refiMonthsOfTaxes'
                      type='number'
                      defaultValue={refinanceParams?.monthsOfTaxes || '2'}
                      placeholder='2'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='refiMortgageInsurance'>
                      Mortgage Insurance (Annual)
                    </Label>
                    <Input
                      id='refiMortgageInsurance'
                      type='number'
                      defaultValue={refinanceParams?.mortgageInsurance || '0'}
                      placeholder='0'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button type='submit'>Update Hard Money Financing</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Calculations Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Cash Out of Pocket */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Out Of Pocket</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>
                    Hard Cash to Close
                  </TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Repairs</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>
                    Interest During Rehab
                  </TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-bold'>TOTAL</TableCell>
                  <TableCell className='text-right font-bold'>$0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Monthly Cash Flow (After Refi) */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow (After Refi)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>Rent</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Note Payment</TableCell>
                  <TableCell className='text-right'>-$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Property Tax</TableCell>
                  <TableCell className='text-right'>-$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Insurance</TableCell>
                  <TableCell className='text-right'>-$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>HOA</TableCell>
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

        {/* Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Returns & Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>Equity Capture</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Cash After Refi</TableCell>
                  <TableCell className='text-right'>$0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>
                    Cash on Cash ROI
                  </TableCell>
                  <TableCell className='text-right'>0.00%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>Cap Rate</TableCell>
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
