import type { RequestHandler } from "express";
import { submitProfileSchema } from "./borrower.validation";
import * as borrowerService from "./borrower.service";
import { ApiError } from "../../utils/ApiError";

/** Narrows req.auth for handlers mounted behind the authenticate middleware. */
function requireAuth(req: Parameters<RequestHandler>[0]): { userId: string } {
  if (!req.auth) {
    throw ApiError.unauthorized();
  }
  return { userId: req.auth.userId };
}

export const submitProfile: RequestHandler = async (req, res) => {
  const { userId } = requireAuth(req);
  const input = submitProfileSchema.parse(req.body);

  const { profile, evaluation } = await borrowerService.submitProfile(userId, input);

  res.json({
    success: true,
    message: "Eligibility check passed",
    data: {
      profile: profile.toJSON(),
      eligibility: {
        status: evaluation.status,
        ageYears: evaluation.ageYears,
        rules: evaluation.rules,
      },
    },
  });
};

export const getProfile: RequestHandler = async (req, res) => {
  const { userId } = requireAuth(req);
  const profile = await borrowerService.getProfile(userId);

  res.json({
    success: true,
    // Null rather than a 404: "this borrower has not filled in their details
    // yet" is a normal state of the application flow, not a missing resource.
    data: { profile: profile ? profile.toJSON() : null },
  });
};
