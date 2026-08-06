import {
  MAX_AGE_YEARS,
  MIN_AGE_YEARS,
  MIN_MONTHLY_SALARY,
  PAN_PATTERN,
} from "./constants";
import type { EmploymentMode } from "./types";

/**
 * The eligibility rules, mirrored from the server.
 *
 * This copy exists only so the applicant sees a rule turn green or red as they
 * type, instead of discovering four problems after submitting. It is never the
 * decision: the same rules run again on the server, which is the only place
 * they cannot be bypassed, and its verdict is what creates or refuses the
 * application.
 *
 * Kept deliberately parallel to server/src/modules/borrower/bre.ts. If a
 * threshold changes, both files and both constant files change together.
 */

export type RuleState = "pending" | "passed" | "failed";

export interface RulePreview {
  code: "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";
  label: string;
  state: RuleState;
  message?: string;
}

export interface EligibilityDraft {
  pan: string;
  dateOfBirth: string;
  monthlySalary: string;
  employmentMode: EmploymentMode | "";
}

/**
 * Whole years between two dates, using UTC throughout for the same reason the
 * server does: a date entered as 1995-06-15 parses to UTC midnight, and reading
 * it back with local-time accessors can shift it a day and change the age by a
 * year at a birthday boundary.
 */
export function calculateAge(dateOfBirth: string, asOf: Date = new Date()): number | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  let age = asOf.getUTCFullYear() - dob.getUTCFullYear();
  const monthDifference = asOf.getUTCMonth() - dob.getUTCMonth();

  if (monthDifference < 0 || (monthDifference === 0 && asOf.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }

  return age;
}

/**
 * Evaluates what has been filled in so far.
 *
 * A rule with no input yet is "pending" rather than failed — showing four red
 * crosses on an empty form tells the applicant they have done something wrong
 * before they have done anything at all.
 */
export function previewEligibility(draft: EligibilityDraft): RulePreview[] {
  const age = calculateAge(draft.dateOfBirth);
  const salary = draft.monthlySalary === "" ? null : Number(draft.monthlySalary);
  const pan = draft.pan.trim().toUpperCase();

  return [
    {
      code: "AGE",
      label: `Aged between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS}`,
      state: age === null ? "pending" : age >= MIN_AGE_YEARS && age <= MAX_AGE_YEARS ? "passed" : "failed",
      message: age === null ? undefined : `Age ${age}`,
    },
    {
      code: "SALARY",
      label: `Monthly salary of at least ₹${MIN_MONTHLY_SALARY.toLocaleString("en-IN")}`,
      state:
        salary === null || Number.isNaN(salary)
          ? "pending"
          : salary >= MIN_MONTHLY_SALARY
            ? "passed"
            : "failed",
    },
    {
      code: "PAN",
      label: "Valid PAN, in the format ABCDE1234F",
      state: pan === "" ? "pending" : PAN_PATTERN.test(pan) ? "passed" : "failed",
    },
    {
      code: "EMPLOYMENT",
      label: "Currently employed or self-employed",
      state:
        draft.employmentMode === ""
          ? "pending"
          : draft.employmentMode === "UNEMPLOYED"
            ? "failed"
            : "passed",
    },
  ];
}

export function allRulesPassed(rules: RulePreview[]): boolean {
  return rules.every((rule) => rule.state === "passed");
}
