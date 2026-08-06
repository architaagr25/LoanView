import { ANNUAL_INTEREST_RATE, DAYS_IN_YEAR } from "./constants";

export interface LoanQuote {
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

/**
 * Rounds to two decimal places, matching the server exactly.
 *
 * Both sides must round identically, or the figure shown while the slider moves
 * would differ by a paisa from the figure stored when the application is
 * submitted — and the borrower would be right to notice.
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Simple interest, mirrored from server/src/modules/loans/loan.calculator.ts:
 *
 *   SI = (P x R x T) / (365 x 100)     T = tenure in days
 *   Total Repayment = P + SI
 *
 * Computed locally so the panel updates as the sliders move — a slider cannot
 * wait for a round trip on every pixel. This is display only: the loan is
 * created from the amount and tenure alone, and the server recalculates every
 * figure from scratch. If the two ever disagreed, the server's answer is the
 * one that exists.
 */
export function quoteLoan(
  principal: number,
  tenureDays: number,
  annualRatePercent: number = ANNUAL_INTEREST_RATE,
): LoanQuote {
  const interestAmount = roundCurrency(
    (principal * annualRatePercent * tenureDays) / (DAYS_IN_YEAR * 100),
  );

  return {
    principal,
    tenureDays,
    interestRate: annualRatePercent,
    interestAmount,
    totalRepayment: roundCurrency(principal + interestAmount),
  };
}
