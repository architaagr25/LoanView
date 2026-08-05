/**
 * Shared enumerations.
 *
 * Written as frozen objects with derived union types rather than TypeScript
 * `enum` declarations. The union type is a plain string union, so values can be
 * compared, serialised to JSON, and stored in Mongo without conversion, while
 * the object gives a runtime list for schema validation and iteration.
 */

export const UserRole = {
  ADMIN: "admin",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  BORROWER: "borrower",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const USER_ROLES = Object.values(UserRole);

/** Roles that belong to internal staff and may reach the operations dashboard. */
export const STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SALES,
  UserRole.SANCTION,
  UserRole.DISBURSEMENT,
  UserRole.COLLECTION,
];

export const EmploymentMode = {
  SALARIED: "SALARIED",
  SELF_EMPLOYED: "SELF_EMPLOYED",
  UNEMPLOYED: "UNEMPLOYED",
} as const;

export type EmploymentMode = (typeof EmploymentMode)[keyof typeof EmploymentMode];
export const EMPLOYMENT_MODES = Object.values(EmploymentMode);

export const BreStatus = {
  PASSED: "PASSED",
  REJECTED: "REJECTED",
} as const;

export type BreStatus = (typeof BreStatus)[keyof typeof BreStatus];
export const BRE_STATUSES = Object.values(BreStatus);

/**
 * Loan lifecycle.
 *
 *   APPLIED     borrower submitted the request, awaiting sanction review
 *   SANCTIONED  approved by sanction, awaiting release of funds
 *   REJECTED    declined by sanction, with a reason — terminal
 *   DISBURSED   funds released, repayments now being collected
 *   CLOSED      fully repaid — terminal
 */
export const LoanStatus = {
  APPLIED: "APPLIED",
  SANCTIONED: "SANCTIONED",
  REJECTED: "REJECTED",
  DISBURSED: "DISBURSED",
  CLOSED: "CLOSED",
} as const;

export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];
export const LOAN_STATUSES = Object.values(LoanStatus);

/**
 * The only status changes the system permits, and who may trigger each one.
 * Enforced in the service layer so an out-of-order transition is rejected even
 * if a request reaches the endpoint directly, bypassing the interface.
 */
export const ALLOWED_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  [LoanStatus.APPLIED]: [LoanStatus.SANCTIONED, LoanStatus.REJECTED],
  [LoanStatus.SANCTIONED]: [LoanStatus.DISBURSED],
  [LoanStatus.DISBURSED]: [LoanStatus.CLOSED],
  [LoanStatus.REJECTED]: [],
  [LoanStatus.CLOSED]: [],
};
