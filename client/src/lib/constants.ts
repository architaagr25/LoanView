import type { DashboardModule, EmploymentMode, LoanStatus, UserRole } from "./types";

/**
 * Business rules mirrored from the server.
 *
 * These exist so sliders can be bounded and eligibility feedback can appear as
 * the user types, without a round trip on every keystroke. They are a copy, and
 * a copy can drift — so nothing here is ever the final word. Every value is
 * re-validated by the API, which is the only place a decision is actually made.
 */

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const MIN_AGE_YEARS = 23;
export const MAX_AGE_YEARS = 50;
export const MIN_MONTHLY_SALARY = 25_000;

export const MIN_LOAN_AMOUNT = 50_000;
export const MAX_LOAN_AMOUNT = 500_000;
export const LOAN_AMOUNT_STEP = 5_000;

export const MIN_TENURE_DAYS = 30;
export const MAX_TENURE_DAYS = 365;
export const TENURE_STEP_DAYS = 5;

export const ANNUAL_INTEREST_RATE = 12;
export const DAYS_IN_YEAR = 365;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_UPLOAD_TYPES = ".pdf,.jpg,.jpeg,.png";

export const EMPLOYMENT_OPTIONS: Array<{ value: EmploymentMode; label: string }> = [
  { value: "SALARIED", label: "Salaried" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
];

/** Wording shown to users, kept apart from the stored value. */
export const LOAN_STATUS_LABEL: Record<LoanStatus, string> = {
  APPLIED: "Applied",
  SANCTIONED: "Sanctioned",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
  CLOSED: "Closed",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  sales: "Sales",
  sanction: "Sanction",
  disbursement: "Disbursement",
  collection: "Collection",
  borrower: "Borrower",
};

export const MODULE_LABEL: Record<DashboardModule, string> = {
  sales: "Sales",
  sanction: "Sanction",
  disbursement: "Disbursement",
  collection: "Collection",
};

export const MODULE_DESCRIPTION: Record<DashboardModule, string> = {
  sales: "Registered borrowers who have not yet applied",
  sanction: "Applications awaiting a decision",
  disbursement: "Sanctioned loans awaiting release of funds",
  collection: "Active loans and repayments",
};
