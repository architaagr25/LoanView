import mongoose, { Types } from "mongoose";
import { Loan, Payment, type LoanDocument, type PaymentDocument } from "../../models";
import { LoanStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { roundCurrency } from "../loans/loan.calculator";
import { assertTransitionAllowed, listLoansByStatus } from "../loans/loan.service";
import type { RecordPaymentInput } from "./collection.validation";

/** Disbursed loans are the ones with money outstanding. */
export function listActiveLoans(): Promise<LoanDocument[]> {
  return listLoansByStatus([LoanStatus.DISBURSED]);
}

export interface PaymentResult {
  loan: LoanDocument;
  payment: PaymentDocument;
  closed: boolean;
}

/**
 * Records a repayment and closes the loan once it is fully repaid.
 *
 * Runs inside a database transaction. Recording a payment writes to two
 * collections — the payment itself and the running total on the loan — and
 * those two writes must either both happen or neither. Without a transaction, a
 * failure between them leaves a payment that the balance does not reflect, and
 * the loan can then never reach exactly zero.
 *
 * The transaction also makes the outstanding-balance check meaningful. Two
 * executives recording the final payment at the same moment would otherwise
 * both read the same balance, both find their amount acceptable, and together
 * overpay the loan.
 */
export async function recordPayment(
  loanId: string,
  actorId: string,
  input: RecordPaymentInput,
): Promise<PaymentResult> {
  const session = await mongoose.startSession();

  try {
    let outcome: PaymentResult | undefined;

    await session.withTransaction(async () => {
      const loan = await Loan.findById(loanId).session(session);

      if (!loan) {
        throw ApiError.notFound("Loan not found");
      }

      if (loan.status !== LoanStatus.DISBURSED) {
        throw ApiError.conflict(
          `Payments can only be recorded against a disbursed loan. This loan is ${loan.status}.`,
        );
      }

      // Compared by calendar day, not by instant. A payment date arrives as a
      // date with no time and therefore parses to midnight, while disbursement
      // carries a real timestamp — so a same-day repayment would otherwise be
      // rejected for preceding a disbursement that happened that afternoon.
      if (loan.disbursedAt && input.paidOn.getTime() < startOfUtcDay(loan.disbursedAt)) {
        throw ApiError.badRequest("Payment date cannot be earlier than the disbursement date");
      }

      const outstanding = roundCurrency(loan.totalRepayment - loan.amountPaid);

      if (input.amount > outstanding) {
        throw ApiError.badRequest(
          `Payment of ₹${input.amount.toFixed(2)} exceeds the outstanding balance of ₹${outstanding.toFixed(2)}`,
        );
      }

      const [payment] = await Payment.create(
        [
          {
            loan: loan._id,
            borrower: loan.borrower,
            utrNumber: input.utrNumber,
            amount: input.amount,
            paidOn: input.paidOn,
            recordedBy: new Types.ObjectId(actorId),
          },
        ],
        { session },
      );

      if (!payment) {
        throw new Error("Payment could not be created");
      }

      loan.amountPaid = roundCurrency(loan.amountPaid + input.amount);

      // Compared with >= rather than ===. The overpayment guard above already
      // prevents exceeding the total, so this only ever triggers on an exact
      // match — but a strict equality test on floating point numbers would be a
      // fragile thing for a loan's closure to depend on.
      const fullyRepaid = loan.amountPaid >= loan.totalRepayment;

      if (fullyRepaid) {
        assertTransitionAllowed(loan.status, LoanStatus.CLOSED);
        loan.status = LoanStatus.CLOSED;
        loan.closedAt = new Date();
        loan.statusHistory.push({
          status: LoanStatus.CLOSED,
          changedBy: new Types.ObjectId(actorId),
          changedAt: new Date(),
          note: "Loan fully repaid",
        });
      }

      await loan.save({ session });

      outcome = { loan, payment, closed: fullyRepaid };
    });

    if (!outcome) {
      throw new Error("Payment transaction produced no result");
    }

    return outcome;
  } catch (error) {
    // The unique index on utrNumber is what actually prevents a duplicate; this
    // only turns it into a message that names the field in question.
    if (isDuplicateUtr(error)) {
      throw ApiError.conflict(
        `A payment with UTR ${input.utrNumber} has already been recorded`,
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

/** Midnight UTC on the day the given instant falls, as a timestamp. */
function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isDuplicateUtr(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: number; keyValue?: Record<string, unknown> };
  return candidate.code === 11000 && candidate.keyValue !== undefined && "utrNumber" in candidate.keyValue;
}
