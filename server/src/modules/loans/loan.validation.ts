import { z } from "zod";
import {
  MAX_LOAN_AMOUNT,
  MAX_TENURE_DAYS,
  MIN_LOAN_AMOUNT,
  MIN_TENURE_DAYS,
} from "../../constants/business";

/**
 * Only the two values the borrower actually chooses are accepted. Interest,
 * total repayment and the rate are all computed on the server — sending them
 * would let a client dictate the terms of its own loan.
 */
export const applyForLoanSchema = z.object({
  amount: z.coerce
    .number()
    .int("Loan amount must be a whole number of rupees")
    .min(MIN_LOAN_AMOUNT, `Loan amount must be at least ₹${MIN_LOAN_AMOUNT.toLocaleString("en-IN")}`)
    .max(MAX_LOAN_AMOUNT, `Loan amount cannot exceed ₹${MAX_LOAN_AMOUNT.toLocaleString("en-IN")}`),

  tenureDays: z.coerce
    .number()
    .int("Tenure must be a whole number of days")
    .min(MIN_TENURE_DAYS, `Tenure must be at least ${MIN_TENURE_DAYS} days`)
    .max(MAX_TENURE_DAYS, `Tenure cannot exceed ${MAX_TENURE_DAYS} days`),
});

export type ApplyForLoanInput = z.infer<typeof applyForLoanSchema>;
