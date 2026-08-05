import {
  MAX_AGE_YEARS,
  MIN_AGE_YEARS,
  MIN_MONTHLY_SALARY,
  PAN_REGEX,
} from "../../constants/business";
import { BreStatus, EmploymentMode } from "../../types/enums";

export interface BreInput {
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface BreRuleOutcome {
  code: "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";
  label: string;
  passed: boolean;
  /** Present only when the rule failed — explains what to correct. */
  reason?: string;
}

export interface BreEvaluation {
  status: BreStatus;
  ageYears: number;
  rules: BreRuleOutcome[];
  /** Messages for every failed rule, in rule order. */
  reasons: string[];
  evaluatedAt: Date;
}

/**
 * Whole years elapsed between two dates.
 *
 * UTC accessors throughout. A date submitted as "1995-06-15" is parsed as UTC
 * midnight, so reading it with local-time accessors shifts it a day in some
 * time zones — enough to change a computed age by a year for someone whose
 * birthday falls on the boundary, and to make the rule engine give different
 * answers on machines in different regions.
 */
export function calculateAge(dateOfBirth: Date, asOf: Date = new Date()): number {
  let age = asOf.getUTCFullYear() - dateOfBirth.getUTCFullYear();

  const monthDifference = asOf.getUTCMonth() - dateOfBirth.getUTCMonth();
  const birthdayNotReached =
    monthDifference < 0 ||
    (monthDifference === 0 && asOf.getUTCDate() < dateOfBirth.getUTCDate());

  if (birthdayNotReached) {
    age -= 1;
  }

  return age;
}

/**
 * Applies every eligibility rule and reports the outcome of each.
 *
 * Pure: no database, no request, no clock of its own unless one is omitted.
 * That makes it directly testable, and lets the same function be called from a
 * request handler, a script, or a test without any setup.
 *
 * All four rules are always evaluated — the function never stops at the first
 * failure. An applicant who is both too young and underpaid should be told both
 * at once rather than fixing one problem and discovering the next.
 */
export function evaluateEligibility(input: BreInput, asOf: Date = new Date()): BreEvaluation {
  const ageYears = calculateAge(input.dateOfBirth, asOf);

  const rules: BreRuleOutcome[] = [
    {
      code: "AGE",
      label: `Age must be between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS}`,
      passed: ageYears >= MIN_AGE_YEARS && ageYears <= MAX_AGE_YEARS,
      reason: `Applicant age is ${ageYears}. Age must be between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS} years.`,
    },
    {
      code: "SALARY",
      label: `Monthly salary must be at least ${MIN_MONTHLY_SALARY}`,
      passed: input.monthlySalary >= MIN_MONTHLY_SALARY,
      reason: `Monthly salary must be at least ₹${MIN_MONTHLY_SALARY.toLocaleString("en-IN")}.`,
    },
    {
      code: "PAN",
      label: "PAN must be in a valid format",
      passed: PAN_REGEX.test(input.pan.trim().toUpperCase()),
      reason: "PAN must follow the format ABCDE1234F — five letters, four digits, then one letter.",
    },
    {
      code: "EMPLOYMENT",
      label: "Applicant must be employed",
      passed: input.employmentMode !== EmploymentMode.UNEMPLOYED,
      reason: "Loans are not offered to unemployed applicants.",
    },
  ];

  const failed = rules.filter((rule) => !rule.passed);

  return {
    status: failed.length === 0 ? BreStatus.PASSED : BreStatus.REJECTED,
    ageYears,
    // Drop the explanation from rules that passed, so the stored record does
    // not read as though a satisfied rule had a complaint against it.
    rules: rules.map((rule) => (rule.passed ? { ...rule, reason: undefined } : rule)),
    reasons: failed.map((rule) => rule.reason ?? rule.label),
    evaluatedAt: asOf,
  };
}
