import { ANNUAL_INTEREST_RATE, DAYS_IN_YEAR } from "../../constants/business";

export interface LoanTerms {
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

/**
 * Rounds to two decimal places.
 *
 * Interest almost never divides into whole paise, and binary floating point
 * cannot represent most decimal fractions exactly — 0.1 + 0.2 famously is not
 * 0.3. Rounding at each stored figure keeps the numbers the borrower is shown
 * identical to the numbers repayments are checked against, which matters when
 * the final payment has to bring the balance to exactly zero.
 *
 * EPSILON is added before rounding to correct values that land a fraction below
 * a .005 boundary purely through representation error.
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Simple interest, as specified:
 *
 *   SI = (P x R x T) / (365 x 100)     T = tenure in days
 *   Total Repayment = P + SI
 *
 * The rate is a parameter with a default rather than being read directly from
 * the constant, so an existing loan can be recalculated on the terms it was
 * agreed under even if the current rate has since changed.
 */
export function calculateLoanTerms(
  principal: number,
  tenureDays: number,
  annualRatePercent: number = ANNUAL_INTEREST_RATE,
): LoanTerms {
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
