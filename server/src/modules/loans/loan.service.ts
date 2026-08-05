import { Loan, Payment, Profile, type LoanDocument } from "../../models";
import { ACTIVE_LOAN_STATUSES, BreStatus, LoanStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { calculateLoanTerms } from "./loan.calculator";
import type { ApplyForLoanInput } from "./loan.validation";

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
