import { Types } from "mongoose";
import { Loan, Payment, Profile, type LoanDocument } from "../../models";
import { ACTIVE_LOAN_STATUSES, ALLOWED_TRANSITIONS, BreStatus, LoanStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { calculateLoanTerms } from "./loan.calculator";
import type { ApplyForLoanInput } from "./loan.validation";

/** Fields the dashboard needs about the applicant behind a loan. */
const BORROWER_FIELDS = "name email createdAt";
const PROFILE_FIELDS =
  "fullName pan dateOfBirth ageYears monthlySalary employmentMode salarySlip bre";

/**
 * Creates a loan application.
 *
 * The borrower supplies only the amount and the tenure. Every monetary figure
 * is recalculated here from those two inputs, so a modified request cannot
 * produce a loan on terms the system never offered.
 */
export async function applyForLoan(
  userId: string,
  input: ApplyForLoanInput,
): Promise<LoanDocument> {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw ApiError.badRequest("Submit your personal details before applying");
  }

  // Re-checked here rather than assumed. The profile is only ever stored after
  // passing, but the application step must not depend on that being true
  // elsewhere — this is the gate that actually protects loan creation.
  if (profile.bre.status !== BreStatus.PASSED) {
    throw ApiError.unprocessable("Your eligibility check has not been passed");
  }

  if (!profile.salarySlip) {
    throw ApiError.badRequest("Upload your salary slip before applying");
  }

  const existingLoan = await Loan.findOne({
    borrower: userId,
    status: { $in: ACTIVE_LOAN_STATUSES },
  }).select("_id status");

  if (existingLoan) {
    throw ApiError.conflict(
      `You already have a loan in progress (${existingLoan.status}). It must be closed before applying again.`,
    );
  }

  const terms = calculateLoanTerms(input.amount, input.tenureDays);

  return Loan.create({
    borrower: userId,
    profile: profile._id,
    principal: terms.principal,
    tenureDays: terms.tenureDays,
    interestRate: terms.interestRate,
    interestAmount: terms.interestAmount,
    totalRepayment: terms.totalRepayment,
    amountPaid: 0,
    status: LoanStatus.APPLIED,
    statusHistory: [
      {
        status: LoanStatus.APPLIED,
        changedBy: userId,
        changedAt: new Date(),
        note: "Application submitted by borrower",
      },
    ],
  });
}

export async function listLoansForBorrower(userId: string): Promise<LoanDocument[]> {
  return Loan.find({ borrower: userId }).sort({ createdAt: -1 });
}

/**
 * A borrower's view of one of their own loans.
 *
 * The borrower id is part of the query rather than being compared afterwards,
 * so another borrower's loan is simply not found. Fetching first and checking
 * ownership second is the same logic, but it leaves a gap wherever someone
 * forgets the second half.
 */
export async function getLoanForBorrower(userId: string, loanId: string) {
  const loan = await Loan.findOne({ _id: loanId, borrower: userId });

  if (!loan) {
    throw ApiError.notFound("Loan not found");
  }

  const payments = await Payment.find({ loan: loan._id }).sort({ paidOn: -1 });

  return { loan, payments };
}

/* ------------------------------------------------------------------------- */
/* Operations dashboard                                                       */
/* ------------------------------------------------------------------------- */

/**
 * Loans in the given states, with the applicant's details attached.
 *
 * Every dashboard module needs the same thing — a queue filtered by status,
 * newest first, showing who applied and on what basis — so the query lives
 * here once rather than being rewritten in four places with four slightly
 * different sets of populated fields.
 */
export async function listLoansByStatus(statuses: LoanStatus[]): Promise<LoanDocument[]> {
  return Loan.find({ status: { $in: statuses } })
    .sort({ createdAt: -1 })
    .populate("borrower", BORROWER_FIELDS)
    .populate("profile", PROFILE_FIELDS);
}

/** Full picture of one loan for a staff reviewer: applicant, terms, payments. */
export async function getLoanDetail(loanId: string) {
  const loan = await Loan.findById(loanId)
    .populate("borrower", BORROWER_FIELDS)
    .populate("profile", PROFILE_FIELDS);

  if (!loan) {
    throw ApiError.notFound("Loan not found");
  }

  const payments = await Payment.find({ loan: loan._id })
    .sort({ paidOn: -1 })
    .populate("recordedBy", "name email");

  return { loan, payments };
}

interface TransitionOptions {
  loanId: string;
  to: LoanStatus;
  actorId: string;
  note?: string;
  /** Applied to the loan after the transition is approved, before saving. */
  apply?: (loan: LoanDocument) => void;
}

/**
 * The single point at which a loan changes status.
 *
 * Every move is checked against ALLOWED_TRANSITIONS, so an out-of-order request
 * is refused no matter which endpoint it arrives through — disbursing a loan
 * that was never sanctioned, sanctioning one that is already closed. Routing
 * every change through one function also guarantees the audit trail is written,
 * rather than depending on each caller remembering to append to it.
 */
export async function transitionLoan({
  loanId,
  to,
  actorId,
  note,
  apply,
}: TransitionOptions): Promise<LoanDocument> {
  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw ApiError.notFound("Loan not found");
  }

  const allowedNext = ALLOWED_TRANSITIONS[loan.status];

  if (!allowedNext.includes(to)) {
    throw ApiError.conflict(
      allowedNext.length > 0
        ? `A loan with status ${loan.status} cannot be moved to ${to}. Allowed next: ${allowedNext.join(", ")}.`
        : `This loan is ${loan.status} and can no longer be changed.`,
    );
  }

  loan.status = to;
  apply?.(loan);

  loan.statusHistory.push({
    status: to,
    changedBy: new Types.ObjectId(actorId),
    changedAt: new Date(),
    note,
  });

  await loan.save();
  return loan;
}
