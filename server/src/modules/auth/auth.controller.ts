import type { RequestHandler } from "express";
import { loginSchema, signupSchema } from "./auth.validation";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";
import { ApiError } from "../../utils/ApiError";

/**
 * Bodies are parsed here rather than by a validation middleware. parse() both
 * validates and narrows the type, so the value handed to the service is typed
 * without any cast. A middleware would have to write the result back onto
 * req.body, where its type is lost again.
 *
 * A failed parse throws a ZodError, which the central error handler renders as
 * a 400 listing each offending field.
 */
export const signup: RequestHandler = async (req, res) => {
  const input = signupSchema.parse(req.body);
  const result = await registerUser(input);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
};

export const login: RequestHandler = async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);

  res.json({
    success: true,
    message: "Signed in successfully",
    data: result,
  });
};

export const me: RequestHandler = async (req, res) => {
  // authenticate runs before this handler, so req.auth is always populated —
  // the guard exists to prove it to the compiler rather than to handle a case
  // that can actually occur.
  if (!req.auth) {
    throw ApiError.unauthorized();
  }

  const user = await getCurrentUser(req.auth.userId);

  res.json({
    success: true,
    data: { user },
  });
};
