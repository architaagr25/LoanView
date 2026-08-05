import { FileAsset, Loan, Profile, type ProfileDocument } from "../../models";
import { ACTIVE_LOAN_STATUSES, BreStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { detectFileType, sanitiseFilename } from "../../utils/fileSignature";
import { evaluateEligibility, type BreEvaluation } from "./bre";
import type { SubmitProfileInput } from "./borrower.validation";

/**
 * A borrower may revise their details freely until an application is in play.
 * While a loan is live, those details are the basis of a decision someone made,
 * and quietly changing them underneath that decision would make the audit trail
 * meaningless. Rejected and closed loans are finished, so they impose no such
 * restriction — a borrower whose loan closed may reapply with fresh details.
 */
async function assertNoLoanInProgress(userId: string): Promise<void> {
  const activeLoan = await Loan.findOne({
    borrower: userId,
    status: { $in: ACTIVE_LOAN_STATUSES },
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

export async function saveSalarySlip(
  userId: string,
  file: Express.Multer.File,
): Promise<ProfileDocument> {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw ApiError.badRequest("Submit your personal details before uploading a salary slip");
  }

  await assertNoLoanInProgress(userId);

  // The declared type and extension were checked as the request arrived; this
  // checks what the file actually contains, which the sender cannot fake.
  const detectedType = detectFileType(file.buffer);
  if (!detectedType) {
    throw ApiError.badRequest("File contents do not match a PDF, JPG or PNG");
  }

  const originalName = sanitiseFilename(file.originalname);

  const asset = await FileAsset.create({
    owner: userId,
    originalName,
    mimeType: detectedType,
    sizeBytes: file.size,
    data: file.buffer,
  });

  const previousFileId = profile.salarySlip?.file;

  profile.salarySlip = {
    file: asset._id,
    originalName,
    mimeType: detectedType,
    sizeBytes: file.size,
    uploadedAt: new Date(),
  };
  await profile.save();

  // The old file is removed only after the profile points at its replacement.
  // Deleting first would leave the profile referencing a missing file if the
  // save failed in between.
  if (previousFileId) {
    await FileAsset.findByIdAndDelete(previousFileId);
  }

  return profile;
}

function isDuplicateKey(error: unknown, field: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: number; keyValue?: Record<string, unknown> };
  return candidate.code === 11000 && candidate.keyValue !== undefined && field in candidate.keyValue;
}
