import type { SchemaOptions } from "mongoose";

/**
 * Common options applied to every schema.
 *
 * Documents are serialised with `id` instead of `_id`, without the internal
 * version key, and with virtuals included — so what the API returns is shaped
 * for a client rather than mirroring Mongo's storage format. Any field named in
 * `hiddenFields` is stripped on the way out, which is the last line of defence
 * for values like a password hash.
 */
export function schemaOptions(hiddenFields: string[] = []): SchemaOptions {
  return {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret._id;
        for (const field of hiddenFields) {
          delete ret[field];
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  };
}
