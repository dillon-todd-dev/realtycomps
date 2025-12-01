import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysAgo(createdAt: Date) {
  const today = new Date();
  const creationDate = new Date(createdAt);

  const timeDifference = today.getTime() - creationDate.getTime();

  const dayDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
  return dayDifference;
}

export function monthlyLoanAmount(
  loanTermMonths: number,
  interestRateMonthly: number,
  loanAmount: number
) {
  const interestExponent = (1 + interestRateMonthly) ** loanTermMonths;
  const top = interestRateMonthly * interestExponent;
  const bottom = interestExponent - 1;
  return loanAmount * (top / bottom);
}

export function formatDollarAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
