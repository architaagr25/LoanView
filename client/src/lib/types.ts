/**
 * Shapes returned by the API.
 *
 * Written by hand rather than generated, and deliberately narrow: these
 * describe what the interface actually reads, so a change to a field the
 * frontend depends on shows up as a type error rather than as undefined at
 * runtime.
 */

export type UserRole =
  | "admin"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "borrower";

export type DashboardModule = "sales" | "sanction" | "disbursement" | "collection";

export type LoanStatus = "APPLIED" | "SANCTIONED" | "REJECTED" | "DISBURSED" | "CLOSED";

export type EmploymentMode = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";

export type BreStatus = "PASSED" | "REJECTED";

export type LeadStage = "REGISTERED" | "DETAILS_SUBMITTED" | "DOCUMENTS_UPLOADED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BreRule {
  code: "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";
  label: string;
  passed: boolean;
  reason?: string;
}

export interface SalarySlip {
  file: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Profile {
  id: string;
  user: string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  ageYears: number;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  bre: {
    status: BreStatus;
    reasons: string[];
    evaluatedAt: string;
  };
  salarySlip?: SalarySlip;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  status: LoanStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface Loan {
  id: string;
  borrower: string;
  profile: string;
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  outstandingAmount: number;
  status: LoanStatus;
  statusHistory: StatusHistoryEntry[];
  sanctionedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A loan as the dashboard receives it, with the applicant's details attached.
 * The borrower and profile fields hold ids on the borrower's own endpoints and
 * full objects on the staff endpoints, so the two cases are separate types
 * rather than one type with union fields that every use site must narrow.
 */
export interface LoanWithApplicant extends Omit<Loan, "borrower" | "profile"> {
  borrower: User;
  profile: Profile;
}

export interface Payment {
  id: string;
  loan: string;
  borrower: string;
  utrNumber: string;
  amount: number;
  paidOn: string;
  recordedBy: string | Pick<User, "id" | "name" | "email">;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  stage: LeadStage;
  eligibilityPassed: boolean;
  hasSalarySlip: boolean;
  monthlySalary: number | null;
  employmentMode: EmploymentMode | null;
}

export interface LeadSummary {
  totalBorrowers: number;
  registered: number;
  detailsSubmitted: number;
  documentsUploaded: number;
  converted: number;
}

export interface AuthPayload {
  token: string;
  user: User;
  modules: DashboardModule[];
}
