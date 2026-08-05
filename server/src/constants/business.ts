/**
 * Business constants for the lending product.
 *
 * These values are referenced by the rule engine, the loan calculator, the
 * Mongoose schemas, and the request validators. Keeping one definition means a
 * policy change is a single edit and cannot leave two layers disagreeing.
 */

/** Permanent Account Number: five letters, four digits, one letter. */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Eligibility thresholds
export const MIN_AGE_YEARS = 23;
export const MAX_AGE_YEARS = 50;
export const MIN_MONTHLY_SALARY = 25_000;

// Loan configuration limits
export const MIN_LOAN_AMOUNT = 50_000;
export const MAX_LOAN_AMOUNT = 500_000;
export const MIN_TENURE_DAYS = 30;
export const MAX_TENURE_DAYS = 365;

/** Fixed annual interest rate, in percent. */
export const ANNUAL_INTEREST_RATE = 12;

/** Denominator in the simple interest formula, per the stated specification. */
export const DAYS_IN_YEAR = 365;

// Salary slip upload rules
export const ALLOWED_UPLOAD_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;
