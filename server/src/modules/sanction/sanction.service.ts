import { Types } from "mongoose";
import type { LoanDocument } from "../../models";
import { LoanStatus } from "../../types/enums";
import { listLoansByStatus, transitionLoan } from "../loans/loan.service";

/** The sanction queue: applications waiting on a decision. */
export function listPendingApplications(): Promise<LoanDocument[]> {
  return listLoansByStatus([LoanStatus.APPLIED]);
}

export function approveLoan(loanId: string, actorId: string): Promise<LoanDocument> {
  return transitionLoan({
    loanId,
    to: LoanStatus.SANCTIONED,
    actorId,
    note: "Application approved",
    apply(loan) {
      loan.sanctionedBy = new Types.ObjectId(actorId);
      loan.sanctionedAt = new Date();
      // Cleared in case this loan was previously rejected and reconsidered, so
      // an approved loan never carries a stale rejection reason.
      loan.rejectionReason = undefined;
    },
  });
}

export function rejectLoan(
  loanId: string,
  actorId: string,
  reason: string,
): Promise<LoanDocument> {
  return transitionLoan({
    loanId,
    to: LoanStatus.REJECTED,
    actorId,
    note: reason,
    apply(loan) {
      loan.rejectedBy = new Types.ObjectId(actorId);
      loan.rejectedAt = new Date();
      loan.rejectionReason = reason;
    },
  });
}
