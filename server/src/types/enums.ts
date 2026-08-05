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

/**
 * The four operations modules, each owning one stage of the loan lifecycle.
 * A module's name matches the role that owns it, but they are kept as separate
 * concepts because they answer different questions: a role is who someone is,
 * a module is what part of the dashboard they are looking at.
 */
export const DashboardModule = {
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
} as const;

export type DashboardModule = (typeof DashboardModule)[keyof typeof DashboardModule];
export const DASHBOARD_MODULES = Object.values(DashboardModule);

/** The role permitted to work in each module, before the admin override. */
export const MODULE_OWNER_ROLE: Record<DashboardModule, UserRole> = {
  [DashboardModule.SALES]: UserRole.SALES,
  [DashboardModule.SANCTION]: UserRole.SANCTION,
  [DashboardModule.DISBURSEMENT]: UserRole.DISBURSEMENT,
  [DashboardModule.COLLECTION]: UserRole.COLLECTION,
};

/**
 * Modules a role may open. Admin sees every module; each executive sees exactly
 * one; a borrower sees none, having no dashboard access at all.
 *
 * Used by the authorisation middleware and returned to the frontend so the
 * navigation is built from the same rule the API enforces, rather than from a
 * second copy of the logic that could drift out of step with it.
 */
export function modulesForRole(role: UserRole): DashboardModule[] {
  if (role === UserRole.ADMIN) {
    return [...DASHBOARD_MODULES];
  }
  return DASHBOARD_MODULES.filter((module) => MODULE_OWNER_ROLE[module] === role);
}

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
