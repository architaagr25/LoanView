import type { UserRole } from "./enums";

/**
 * Attaches the authenticated caller to the request object.
 *
 * Declared here rather than cast at each use site, so every handler reads
 * req.auth with full type information and the compiler knows the field exists.
 */
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};
