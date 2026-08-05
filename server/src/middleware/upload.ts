import path from "node:path";
import type { RequestHandler } from "express";
import multer from "multer";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { ALLOWED_UPLOAD_EXTENSIONS, ALLOWED_UPLOAD_MIME_TYPES } from "../constants/business";

const megabytes = (env.MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);

/**
 * Files are buffered in memory rather than written to disk.
 *
 * The hosting platform's filesystem does not survive a restart, so a file on
 * disk would work in testing and then disappear in production. Holding the
 * bytes in memory lets the handler write them straight into the database. Safe
 * because the size limit below is enforced while the request streams in — the
 * process never buffers more than the cap.
 */
const handler = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    // Both the declared type and the extension are checked. Neither is proof of
    // anything on its own — the client supplies both — so the file's actual
    // byte signature is verified later, before it is stored.
    if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      callback(ApiError.badRequest("Only PDF, JPG and PNG files are accepted"));
      return;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(extension)) {
      callback(ApiError.badRequest("File must have a .pdf, .jpg, .jpeg or .png extension"));
      return;
    }

    callback(null, true);
  },
}).single("salarySlip");

/**
 * Translates multer's own error type into the project's error type here, rather
 * than teaching the central error handler about multer. Upload handling stays
 * contained in this file.
 */
export const salarySlipUpload: RequestHandler = (req, res, next) => {
  handler(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case "LIMIT_FILE_SIZE":
          // 413 rather than 400: the request was well-formed, just too large.
          next(new ApiError(413, `File must be ${megabytes} MB or smaller`));
          return;
        case "LIMIT_FILE_COUNT":
        case "LIMIT_UNEXPECTED_FILE":
          next(ApiError.badRequest('Upload exactly one file, in a field named "salarySlip"'));
          return;
        default:
          next(ApiError.badRequest(error.message));
          return;
      }
    }

    next(error);
  });
};
