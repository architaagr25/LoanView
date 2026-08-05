import { Loan, Profile, type ProfileDocument } from "../../models";
import { BreStatus, LoanStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { evaluateEligibility, type BreEvaluation } from "./bre";
import type { SubmitProfileInput } from "./borrower.validation";

/**
 * A borrower may revise their details freely until an application is in play.
 * Once a loan exists in any state other than rejected, the details are the
 * basis of a decision someone made, and quietly changing them underneath that
 * decision would make the audit trail meaningless.
 */
async function assertNoLoanInProgress(userId: string): Promise<void> {
  const activeLoan = await Loan.findOne({
    borrower: userId,
    status: { $ne: LoanStatus.REJECTED },
  }).select("_id status");

  if (activeLoan) {
    throw ApiError.conflict(
      "Personal details cannot be changed while a loan application is in progress",
    );
  }
}

export async function submitProfile(
  userId: string,
  input: SubmitProfileInput,
): Promise<{ profile: ProfileDocument; evaluation: BreEvaluation }> {
  await assertNoLoanInProgress(userId);

  const evaluation = evaluateEligibility({
    pan: input.pan,
    dateOfBirth: input.dateOfBirth,
    monthlySalary: input.monthlySalary,
    employmentMode: input.employmentMode,
  });

  if (evaluation.status === BreStatus.REJECTED) {
    // 422 rather than 400: the request was well-formed and understood, it just
    // does not satisfy the lending policy. Every failed rule is returned so the
    // applicant can correct all of them in one pass.
    throw ApiError.unprocessable("You are not eligible for a loan", {
      reasons: evaluation.reasons,
      rules: evaluation.rules,
      ageYears: evaluation.ageYears,
    });
  }

  try {
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          fullName: input.fullName,
          pan: input.pan,
          dateOfBirth: input.dateOfBirth,
          ageYears: evaluation.ageYears,
          monthlySalary: input.monthlySalary,
          employmentMode: input.employmentMode,
          bre: {
            status: evaluation.status,
            reasons: evaluation.reasons,
            evaluatedAt: evaluation.evaluatedAt,
          },
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!profile) {
      throw ApiError.notFound("Profile could not be saved");
    }

    return { profile, evaluation };
  } catch (error) {
    // The PAN index is unique across all profiles, so this means someone else
    // already registered it. The generic duplicate-key message would name the
    // raw field; this says what actually happened.
    if (isDuplicateKey(error, "pan")) {
      throw ApiError.conflict("This PAN is already registered against another account");
    }
    throw error;
  }
}

export async function getProfile(userId: string): Promise<ProfileDocument | null> {
  return Profile.findOne({ user: userId });
}

function isDuplicateKey(error: unknown, field: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: number; keyValue?: Record<string, unknown> };
  return candidate.code === 11000 && candidate.keyValue !== undefined && field in candidate.keyValue;
}
