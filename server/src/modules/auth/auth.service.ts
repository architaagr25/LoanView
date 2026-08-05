import { User, type UserDocument } from "../../models";
import { UserRole } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import type { LoginInput, SignupInput } from "./auth.validation";

interface AuthResult {
  token: string;
  user: unknown;
}

function buildAuthResult(user: UserDocument): AuthResult {
  return {
    token: signToken({ sub: user._id.toString(), role: user.role }),
    // toJSON strips the password hash and the internal id fields.
    user: user.toJSON(),
  };
}

export async function registerUser(input: SignupInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  // Role is assigned here, never taken from the request. Accepting a role from
  // the signup body would let anyone create themselves an admin account, which
  // would defeat every access control in the system.
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: UserRole.BORROWER,
  });

  return buildAuthResult(user);
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  // passwordHash is select:false on the schema, so it must be requested.
  const user = await User.findOne({ email: input.email }).select("+passwordHash");

  // An unknown email and a wrong password return the same message on purpose.
  // Distinguishing them would let anyone test which addresses hold accounts.
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return buildAuthResult(user);
}

export async function getCurrentUser(userId: string): Promise<unknown> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user.toJSON();
}
