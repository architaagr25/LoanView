import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { UserRole } from "../types/enums";

export interface TokenPayload {
  /** Standard "subject" claim — the user's id. */
  sub: string;
  role: UserRole;
}

/**
 * A token is just signed text supplied by the caller, so its decoded contents
 * are untrusted until the shape is checked. The signature proves nobody altered
 * it; it does not prove the claims are the ones this version of the code
 * expects — a token issued before a change to the payload would still verify.
 */
const tokenPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(UserRole),
});

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Throws on an invalid or expired token. The error handler maps
 * JsonWebTokenError and TokenExpiredError to 401 responses.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return tokenPayloadSchema.parse(decoded);
}
