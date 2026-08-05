import bcrypt from "bcryptjs";

/**
 * Work factor for hashing. Ten rounds costs roughly 100ms on typical hardware —
 * unnoticeable on the two occasions it runs (signup and login), but expensive
 * enough to make offline guessing against a stolen database impractical.
 */
const SALT_ROUNDS = 10;

export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
