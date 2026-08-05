import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { BRE_STATUSES, BreStatus, EMPLOYMENT_MODES, EmploymentMode } from "../types/enums";
import { PAN_REGEX } from "../constants/business";
import { schemaOptions } from "../utils/schema";

/** Outcome of the rule engine at the moment the details were submitted. */
export interface IBreResult {
  status: BreStatus;
  reasons: string[];
  evaluatedAt: Date;
}

export interface ISalarySlip {
  file: Types.ObjectId;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

export interface IProfile {
  user: Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  ageYears: number;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  bre: IBreResult;
  salarySlip?: ISalarySlip;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileDocument = HydratedDocument<IProfile>;

const breResultSchema = new Schema<IBreResult>(
  {
    status: { type: String, enum: BRE_STATUSES, required: true },
    // Every failed rule, not just the first — the applicant should be able to
    // fix everything in one pass instead of discovering problems one at a time.
    reasons: { type: [String], default: [] },
    evaluatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const salarySlipSchema = new Schema<ISalarySlip>(
  {
    file: { type: Schema.Types.ObjectId, ref: "FileAsset", required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false },
);

/**
 * Borrower identity and eligibility data. One profile per user.
 */
const profileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 120,
    },
    // One PAN identifies one taxpayer, so it identifies one borrower. Enforcing
    // uniqueness at the database level stops the same person holding two
    // applications under different logins.
    pan: {
      type: String,
      required: [true, "PAN is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [PAN_REGEX, "PAN must be in the format ABCDE1234F"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    // Age is recomputed on every submission, but the value that the decision was
    // actually based on is stored. Otherwise a record reviewed months later
    // would appear to have been judged against the wrong age.
    ageYears: {
      type: Number,
      required: true,
      min: 0,
    },
    monthlySalary: {
      type: Number,
      required: [true, "Monthly salary is required"],
      min: [0, "Monthly salary cannot be negative"],
    },
    employmentMode: {
      type: String,
      enum: EMPLOYMENT_MODES,
      required: [true, "Employment mode is required"],
    },
    bre: {
      type: breResultSchema,
      required: true,
    },
    salarySlip: {
      type: salarySlipSchema,
      required: false,
    },
  },
  schemaOptions(),
);

// The sales module lists leads by how their eligibility check went.
profileSchema.index({ "bre.status": 1, createdAt: -1 });

export const Profile = model<IProfile>("Profile", profileSchema);
