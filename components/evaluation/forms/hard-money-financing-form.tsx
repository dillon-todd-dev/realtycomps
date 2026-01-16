'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import {
  recalculateMetrics,
  updateHardMoneyLoanParams,
  updateRefinanceLoanParams,
} from '@/actions/evaluations';
import { toast } from 'sonner';
import { Loader2, TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { formatDollarAmount, monthlyLoanAmount } from '@/lib/utils';
import { DollarInput } from '@/components/dollar-input';
import { SelectInput } from '@/components/select-input';
import { EvaluationWithRelations } from '@/lib/types';

interface HardMoneyFinancingFormProps {
  evaluation: EvaluationWithRelations;
}

export default function HardMoneyFinancingForm({
  evaluation,
}: HardMoneyFinancingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    hardLoanToValue: evaluation.hardLoanToValue,
    hardLenderFees: evaluation.hardLenderFees,
    hardInterestRate: evaluation.hardInterestRate,
    hardFirstPhaseCosts: evaluation.hardFirstPhaseCosts,
    refiLoanToValue: evaluation.refiLoanToValue,
    refiLoanTerm: String(evaluation.refiLoanTerm),
    refiInterestRate: evaluation.refiInterestRate,
    refiLenderFees: evaluation.refiLenderFees,
    refiMortgageInsurance: evaluation.refiMortgageInsurance,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateHardMoneyLoanParams(evaluation.id, evaluation.userId, {
          loanToValue: formData.hardLoanToValue,
          lenderFees: formData.hardLenderFees,
          interestRate: formData.hardInterestRate,
          firstPhaseCosts: formData.hardFirstPhaseCosts,
        });
        await updateRefinanceLoanParams(evaluation.id, evaluation.userId, {
          loanToValue: formData.refiLoanToValue,
          loanTerm: Number(formData.refiLoanTerm),
          interestRate: formData.refiInterestRate,
          lenderFees: formData.refiLenderFees,
          mortgageInsurance: formData.refiMortgageInsurance,
        });
        await recalculateMetrics(evaluation.id, evaluation.userId);
        toast.success('Financing terms updated successfully');
      } catch (error) {
        console.error('Failed to update:', error);
        toast.error('Failed to update financing terms');
      }
    });
  }

  // Calculations
  const hardCashToClose = useMemo(() => {
    const ltv = Number(evaluation?.hardLoanToValue);
    const arv = Number(evaluation?.estimatedSalePrice);
    const maxLoanAmount = (ltv / 100) * arv;
    const purchasePrice = Number(evaluation?.purchasePrice);
    const repairs = Number(evaluation?.repairs);
    return purchasePrice + repairs - maxLoanAmount;
  }, [
    evaluation?.hardLoanToValue,
    evaluation?.estimatedSalePrice,
    evaluation?.purchasePrice,
    evaluation?.repairs,
  ]);

  const propertyTax = useMemo(() => {
    return Number(evaluation?.propertyTax) / 12;
  }, [evaluation?.propertyTax]);

  const propertyInsurance = useMemo(() => {
    return Number(evaluation?.insurance) / 12;
  }, [evaluation?.insurance]);

  const mortgageInsurance = useMemo(() => {
    return Number(evaluation?.refiMortgageInsurance) / 12;
  }, [evaluation?.refiMortgageInsurance]);

  const hoa = useMemo(() => {
    return Number(evaluation?.hoa) / 12;
  }, [evaluation?.hoa]);

  const notePayment = useMemo(() => {
    const estimatedSalePrice = Number(evaluation?.estimatedSalePrice);
    const loanToValue = Number(evaluation?.refiLoanToValue) / 100;
    const loanAmount = estimatedSalePrice * loanToValue;
    const monthlyInterestRate = Number(evaluation?.refiInterestRate) / 100 / 12;
    const loanTermMonths = Number(evaluation?.refiLoanTerm) * 12;
    return monthlyLoanAmount(loanTermMonths, monthlyInterestRate, loanAmount);
  }, [
    evaluation?.estimatedSalePrice,
    evaluation?.refiLoanToValue,
    evaluation?.refiInterestRate,
    evaluation?.refiLoanTerm,
  ]);

  const cashflowTotal = useMemo(() => {
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

  const hardClosingCosts = useMemo(() => {
    const hardLenderFees = Number(evaluation?.hardLenderFees);
    const refiLenderFees = Number(evaluation?.refiLenderFees);
    const appraisal = Number(evaluation?.appraisal);
    const survey = Number(evaluation?.survey);
    const inspection = Number(evaluation?.inspection);
    return hardLenderFees + refiLenderFees + appraisal + survey + inspection;
  }, [
    evaluation?.hardLenderFees,
    evaluation?.refiLenderFees,
    evaluation?.appraisal,
    evaluation?.survey,
    evaluation?.inspection,
  ]);

  const hardCashOutOfPocket = useMemo(() => {
    const firstPhaseCosts = Number(evaluation?.hardFirstPhaseCosts);
    return hardCashToClose + hardClosingCosts + firstPhaseCosts;
  }, [hardCashToClose, hardClosingCosts, evaluation?.hardFirstPhaseCosts]);

  const equityCapture = useMemo(() => {
    const purchasePrice = Number(evaluation?.purchasePrice);
    const arv = Number(evaluation.estimatedSalePrice);
    const rehab = Number(evaluation?.repairs);
    const hardLender = Number(evaluation?.hardLenderFees);
    const refiLender = Number(evaluation?.refiLenderFees);
    return arv - (purchasePrice + rehab + hardLender + refiLender);
  }, [
    evaluation?.estimatedSalePrice,
    evaluation?.purchasePrice,
    evaluation?.repairs,
    evaluation?.hardLenderFees,
    evaluation?.refiLenderFees,
  ]);

  const returnOnEquity = useMemo(() => {
    const annualCashFlow = cashflowTotal * 12;
    return (annualCashFlow / equityCapture) * 100;
  }, [cashflowTotal, equityCapture]);

  const cashOnCashReturn = useMemo(() => {
    const annualCashFlow = cashflowTotal * 12;
    return (annualCashFlow / hardCashOutOfPocket) * 100;
  }, [cashflowTotal, hardCashOutOfPocket]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold">Financing Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Configure loan parameters and view projected returns
        </p>
      </div>

      {/* Key Metrics - Prominent display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Cash on Cash</span>
          </div>
          <div className="text-2xl font-bold">
            {cashOnCashReturn.toFixed(1)}%
          </div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Return on Equity</span>
          </div>
          <div className="text-2xl font-bold">{returnOnEquity.toFixed(1)}%</div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Monthly Cash Flow</span>
          </div>
          <div
            className={`text-2xl font-bold ${cashflowTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatDollarAmount(cashflowTotal)}
          </div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Cash Required</span>
          </div>
          <div className="text-2xl font-bold">
            {formatDollarAmount(hardCashOutOfPocket)}
          </div>
        </div>
      </div>

      {/* Loan Parameters Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hard Money Loan Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Hard Money Loan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hardLoanToValue">Loan to Value (%)</Label>
                <SelectInput
                  id="hardLoanToValue"
                  type="number"
                  value={formData.hardLoanToValue ?? '70'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hardLoanToValue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hardLenderFees">Lender & Title Fees</Label>
                <DollarInput
                  id="hardLenderFees"
                  value={formData.hardLenderFees ?? '5000'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hardLenderFees: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hardInterestRate">Interest Rate (%)</Label>
                <SelectInput
                  id="hardInterestRate"
                  type="number"
                  step="0.001"
                  value={formData.hardInterestRate ?? '11'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hardInterestRate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstPhaseCosts">Phase 1 Rehab Costs</Label>
                <DollarInput
                  id="hardFirstPhaseCosts"
                  value={formData.hardFirstPhaseCosts ?? '0'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hardFirstPhaseCosts: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Refinance Loan Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Refinance Loan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refiLoanToValue">Loan to Value (%)</Label>
                <SelectInput
                  id="refiLoanToValue"
                  type="number"
                  step="0.01"
                  value={formData.refiLoanToValue ?? '70'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      refiLoanToValue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refiLoanTerm">Loan Term (years)</Label>
                <SelectInput
                  id="refiLoanTerm"
                  type="number"
                  value={formData.refiLoanTerm}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      refiLoanTerm: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refiInterestRate">Interest Rate (%)</Label>
                <SelectInput
                  id="refiInterestRate"
                  type="number"
                  step="0.001"
                  value={formData.refiInterestRate ?? '7'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      refiInterestRate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refiLenderFees">Refi Lender Fees</Label>
                <DollarInput
                  id="refiLenderFees"
                  value={formData.refiLenderFees ?? '5000'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      refiLenderFees: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="refiMortgageInsurance">
                  Mortgage Insurance (Annual)
                </Label>
                <DollarInput
                  id="refiMortgageInsurance"
                  value={formData.refiMortgageInsurance ?? '0'}
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Financing Terms'
            )}
          </Button>
        </div>
      </form>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gains and Returns */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Gains & Returns
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Equity Capture</span>
              <span className="text-sm font-medium">
                {formatDollarAmount(equityCapture)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Annual Cash Flow</span>
              <span className="text-sm font-medium">
                {formatDollarAmount(cashflowTotal * 12)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Return on Equity</span>
              <span className="text-sm font-medium">
                {returnOnEquity.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-semibold">Cash on Cash Return</span>
              <span className="text-sm font-bold">
                {cashOnCashReturn.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Cash Out of Pocket */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Cash Required
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Hard Cash to Close</span>
              <span className="text-sm font-medium">
                {formatDollarAmount(hardCashToClose)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Closing Costs</span>
              <span className="text-sm font-medium">
                {formatDollarAmount(hardClosingCosts)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Phase 1 Rehab</span>
              <span className="text-sm font-medium">
                {formatDollarAmount(Number(evaluation?.hardFirstPhaseCosts))}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-bold">
                {formatDollarAmount(hardCashOutOfPocket)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Cash Flow */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Monthly Cash Flow
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Monthly Rent</span>
              <span className="text-sm font-medium text-green-600">
                +{formatDollarAmount(Number(evaluation.rent ?? 0))}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Note Payment</span>
              <span className="text-sm font-medium text-red-600">
                -{formatDollarAmount(notePayment)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Taxes & Insurance</span>
              <span className="text-sm font-medium text-red-600">
                -{formatDollarAmount(propertyTax + propertyInsurance)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">HOA & Other</span>
              <span className="text-sm font-medium text-red-600">
                -
                {formatDollarAmount(
                  hoa + mortgageInsurance + Number(evaluation.miscellaneous),
                )}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-semibold">Net Cash Flow</span>
              <span
                className={`text-sm font-bold ${cashflowTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatDollarAmount(cashflowTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
