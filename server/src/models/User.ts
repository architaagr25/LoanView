import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, UserRole } from "../types/enums";
import { schemaOptions } from "../utils/schema";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never returned by a query unless explicitly asked for with
    // .select("+passwordHash"), so it cannot leak through a forgotten omission.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: UserRole.BORROWER,
      required: true,
      index: true,
    },
    // Lets an account be switched off without deleting it and orphaning the
    // loans and payments that reference it.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  schemaOptions(["passwordHash"]),
);

export const User = model<IUser>("User", userSchema);
