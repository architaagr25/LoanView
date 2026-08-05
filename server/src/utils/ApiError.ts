/**
 * Error type that carries the HTTP status the client should receive.
 *
 * Throwing one of these from anywhere in a route or service lets the central
 * error handler produce the right response, so handlers never have to build
 * error responses themselves.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  /** Caller is not authenticated — no token, or the token is invalid/expired. */
  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, message);
  }

  /** Caller is authenticated but their role does not permit this action. */
  static forbidden(message = "You do not have permission to perform this action"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  /** Request conflicts with current state — duplicate value, invalid transition. */
  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  static unprocessable(message: string, details?: unknown): ApiError {
    return new ApiError(422, message, details);
  }
}
