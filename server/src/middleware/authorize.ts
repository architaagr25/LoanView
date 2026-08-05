import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { MODULE_OWNER_ROLE, UserRole, type DashboardModule } from "../types/enums";

/**
 * Restricts a route to an explicit list of roles.
 *
 * Membership is strict — admin is not silently included. Some routes genuinely
 * should not accept an administrator: applying for a loan belongs to a
 * borrower, and an admin quietly passing that check would create a loan with no
 * borrower behind it. Where an admin override is wanted, requireModuleAccess
 * below grants it deliberately.
 */
export function requireRole(...allowed: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    // Reaching here without req.auth means the route was mounted without
    // authenticate in front of it — a wiring mistake, not a client error.
    if (!req.auth) {
      throw ApiError.unauthorized();
    }

    if (!allowed.includes(req.auth.role)) {
      throw ApiError.forbidden(
        `This action requires one of the following roles: ${allowed.join(", ")}`,
      );
    }

    next();
  };
}

/**
 * Restricts a route to the executive who owns a dashboard module, plus admin.
 *
 * Expressing it as "which module is this?" rather than "which roles are
 * allowed?" means the answer comes from MODULE_OWNER_ROLE, so a route cannot
 * drift out of step with the module map, and admin access cannot be forgotten
 * on one route out of twenty.
 */
export function requireModuleAccess(module: DashboardModule): RequestHandler {
  const owner = MODULE_OWNER_ROLE[module];

  return (req, _res, next) => {
    if (!req.auth) {
      throw ApiError.unauthorized();
    }

    const { role } = req.auth;

    if (role === UserRole.ADMIN || role === owner) {
      next();
      return;
    }

    throw ApiError.forbidden(`Your role does not have access to the ${module} module`);
  };
}
