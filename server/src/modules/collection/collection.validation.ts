import { z } from "zod";

export const recordPaymentSchema = z.object({
  utrNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, "UTR number must be at least 6 characters")
    .max(30, "UTR number cannot exceed 30 characters")
    .regex(/^[A-Z0-9]+$/, "UTR number may contain only letters and digits"),

  amount: z.coerce
    .number()
    .positive("Payment amount must be greater than zero")
    // Rupees and paise only. A figure like 100.005 cannot correspond to a real
    // transfer, and would leave a balance that never reaches exactly zero.
    .refine(
      (value) => Math.round(value * 100) === Number((value * 100).toFixed(0)),
      "Payment amount cannot have more than two decimal places",
    ),

  paidOn: z.coerce
    .date({ error: "Enter a valid payment date" })
    .refine((value) => value.getTime() <= Date.now(), "Payment date cannot be in the future"),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
