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
    .refine((value) => value.getTime() <= latestAcceptablePaymentDate(), {
      error: "Payment date cannot be in the future",
    }),
});

/**
 * The newest payment date the server will accept, as a timestamp.
 *
 * A date field sends a calendar day with no time, which parses to midnight UTC,
 * while the server compares against an instant. Those two do not line up: at
 * 00:30 in Delhi it is still the previous afternoon in UTC, so the date the
 * executive is looking at on their own calendar parses to a moment several
 * hours ahead of the server's clock and reads as the future.
 *
 * No time zone is sent with the request, and none is worth inventing. Since no
 * zone runs more than a day ahead of UTC, allowing through the end of the next
 * UTC day accepts today wherever the executive happens to be, while still
 * rejecting a date genuinely in the future.
 */
function latestAcceptablePaymentDate(): number {
  const now = new Date();
  const endOfNextUtcDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 2,
  );
  return endOfNextUtcDay - 1;
}

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
