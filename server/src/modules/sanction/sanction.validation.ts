import { z } from "zod";

export const rejectLoanSchema = z.object({
  // Required, and required to be substantive. A rejection the borrower cannot
  // understand is not a decision they can act on, and "no" is not a reason.
  reason: z
    .string()
    .trim()
    .min(10, "Give a reason of at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type RejectLoanInput = z.infer<typeof rejectLoanSchema>;
