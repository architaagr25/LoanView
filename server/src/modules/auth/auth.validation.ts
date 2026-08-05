import { z } from "zod";

// Trimmed and lowercased before validation, so " Archita@Example.com " and
// "archita@example.com" are treated as the same account rather than two.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  // bcrypt only considers the first 72 bytes of input. Without an upper bound,
  // two different long passwords sharing a 72-byte prefix would both unlock the
  // same account, so the limit is enforced rather than silently applied.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
