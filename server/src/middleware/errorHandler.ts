import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

interface ErrorBody {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

/** Anything that reached the end of the stack without matching a route. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Single place where every error becomes an HTTP response.
 *
 * Express 5 forwards rejections from async handlers here automatically, so
 * route handlers can throw freely instead of wrapping everything in try/catch.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errors: unknown;

  if (err instanceof ZodError) {
    // Request body failed validation — report which fields and why.
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path.join(".") || "(body)",
      message: issue.message,
    }));
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    // Typically a malformed ObjectId in the URL.
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? "value";
    message = `A record with this ${field} already exists`;
  } else if (err instanceof Error && err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please log in again";
  } else if (err instanceof Error && err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  // Client mistakes are noise in the logs; genuine server faults are not.
  if (statusCode >= 500) {
    logger.error(message, err);
  }

  const body: ErrorBody = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  if (!env.isProduction && err instanceof Error && err.stack) body.stack = err.stack;

  res.status(statusCode).json(body);
};

interface DuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is DuplicateKeyError {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}
