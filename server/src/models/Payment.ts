import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { schemaOptions } from "../utils/schema";

export interface IPayment {
  loan: Types.ObjectId;
  borrower: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paidOn: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;

const paymentSchema = new Schema<IPayment>(
  {
    loan: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    // Duplicated from the loan so a borrower's full payment history can be read
    // without joining through every loan they hold.
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /**
     * Unique Transaction Reference for the bank transfer.
     *
     * Uniqueness is a database index, not an application check. Two collection
     * executives recording the same transfer at the same moment would both pass
     * a "does this UTR exist?" lookup and both insert — the index is what
     * actually prevents the duplicate, by rejecting the second write.
     */
    utrNumber: {
      type: String,
      required: [true, "UTR number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Payment amount must be greater than zero"],
    },
    paidOn: {
      type: Date,
      required: [true, "Payment date is required"],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  schemaOptions(),
);

// Payment history for a loan reads newest first.
paymentSchema.index({ loan: 1, paidOn: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
