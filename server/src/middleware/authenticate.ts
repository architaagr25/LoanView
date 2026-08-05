import type { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { User } from "../models";

/**
 * Confirms the caller holds a valid token and identifies who they are.
 *
 * The user is re-read from the database on every request rather than trusting
 * the role inside the token. A token stays valid for its full lifetime, so a
 * role change or a deactivated account would otherwise take days to take
 * effect. The cost is one indexed lookup by primary key per request, which is
 * the right trade for access decisions that are always current.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or malformed authorization header");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    throw ApiError.unauthorized("Missing authentication token");
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account no longer exists or has been deactivated");
  }

  req.auth = {
    userId: user._id.toString(),
    role: user.role,
  };

  next();
};
