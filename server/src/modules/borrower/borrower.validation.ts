import { z } from "zod";
import { EmploymentMode } from "../../types/enums";

export const submitProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name cannot exceed 120 characters"),

  // Deliberately NOT checked against the PAN pattern here. Format is one of the
  // four eligibility rules, so it belongs to the rule engine — otherwise a
  // malformed PAN would be reported as a generic validation error instead of
  // appearing alongside the other eligibility failures the applicant needs to
  // see. Only a sane length is enforced, to reject obvious junk early.
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "PAN is required")
    .max(20, "PAN cannot exceed 20 characters"),

  // zod's default message for an unparseable date reads "expected date,
  // received Date", which is meaningless to whoever filled in the form.
  dateOfBirth: z.coerce
    .date({ error: "Enter a valid date of birth" })
    .refine((value) => value.getTime() <= Date.now(), "Date of birth cannot be in the future")
    .refine((value) => value.getUTCFullYear() >= 1900, "Enter a valid date of birth"),

  monthlySalary: z.coerce
    .number()
    .nonnegative("Monthly salary cannot be negative")
    .max(100_000_000, "Enter a realistic monthly salary"),

  employmentMode: z.enum(EmploymentMode),
});

export type SubmitProfileInput = z.infer<typeof submitProfileSchema>;
