import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { schemaOptions } from "../utils/schema";

export interface IFileAsset {
  owner: Types.ObjectId;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

export type FileAssetDocument = HydratedDocument<IFileAsset>;

/**
 * Uploaded documents, stored as bytes inside MongoDB.
 *
 * The hosting platform's filesystem is ephemeral — anything written to disk is
 * lost on restart or redeploy, so a disk-backed upload would work in testing
 * and then quietly lose files in production. The 5 MB cap enforced at upload
 * keeps every document well inside MongoDB's 16 MB limit.
 */
const fileAssetSchema = new Schema<IFileAsset>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },
    // Excluded by default — a listing query must never drag megabytes of file
    // content along with it. Fetched explicitly only when serving a download.
    data: {
      type: Buffer,
      required: true,
      select: false,
    },
  },
  schemaOptions(["data"]),
);

export const FileAsset = model<IFileAsset>("FileAsset", fileAssetSchema);
