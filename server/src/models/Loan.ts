import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { LOAN_STATUSES, LoanStatus } from "../types/enums";
import {
  ANNUAL_INTEREST_RATE,
  MAX_LOAN_AMOUNT,
  MAX_TENURE_DAYS,
  MIN_LOAN_AMOUNT,
  MIN_TENURE_DAYS,
} from "../constants/business";
import { schemaOptions } from "../utils/schema";

/** One entry per status change, forming an audit trail on the loan itself. */
export interface IStatusHistoryEntry {
  status: LoanStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface ILoan {
  borrower: Types.ObjectId;
  profile: Types.ObjectId;

  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;

  status: LoanStatus;
  statusHistory: IStatusHistoryEntry[];

  sanctionedBy?: Types.ObjectId;
  sanctionedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  disbursedBy?: Types.ObjectId;
  disbursedAt?: Date;
  closedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type LoanDocument = HydratedDocument<ILoan>;

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, enum: LOAN_STATUSES, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changedAt: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { _id: false },
);

const loanSchema = new Schema<ILoan>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    principal: {
      type: Number,
      required: true,
      min: [MIN_LOAN_AMOUNT, `Loan amount cannot be below ${MIN_LOAN_AMOUNT}`],
      max: [MAX_LOAN_AMOUNT, `Loan amount cannot exceed ${MAX_LOAN_AMOUNT}`],
    },
    tenureDays: {
      type: Number,
      required: true,
      min: [MIN_TENURE_DAYS, `Tenure cannot be below ${MIN_TENURE_DAYS} days`],
      max: [MAX_TENURE_DAYS, `Tenure cannot exceed ${MAX_TENURE_DAYS} days`],
    },
    // Interest figures are stored rather than computed on read. The rate is
    // fixed today, but a loan must always show the terms it was agreed on, not
    // whatever the current rate happens to be.
    interestRate: {
      type: Number,
      required: true,
      default: ANNUAL_INTEREST_RATE,
    },
    interestAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRepayment: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: LOAN_STATUSES,
      required: true,
      default: LoanStatus.APPLIED,
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    sanctionedBy: { type: Schema.Types.ObjectId, ref: "User" },
    sanctionedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  schemaOptions(),
);

/**
 * Outstanding balance is derived, never stored.
 *
 * Keeping a second stored figure alongside amountPaid would mean two values
 * that must be updated together, and any code path that updated one without the
 * other would leave the loan permanently wrong. Deriving it makes that
 * impossible.
 */
loanSchema.virtual("outstandingAmount").get(function (this: ILoan): number {
  return Math.round((this.totalRepayment - this.amountPaid) * 100) / 100;
});

// Every dashboard module queries by status, newest first.
loanSchema.index({ status: 1, createdAt: -1 });

export const Loan = model<ILoan>("Loan", loanSchema);
