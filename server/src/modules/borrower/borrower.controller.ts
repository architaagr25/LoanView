import type { RequestHandler } from "express";
import { submitProfileSchema } from "./borrower.validation";
import * as borrowerService from "./borrower.service";
import * as loanService from "../loans/loan.service";
import { applyForLoanSchema } from "../loans/loan.validation";
import { ApiError } from "../../utils/ApiError";
import { routeParam } from "../../utils/http";

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

export const uploadSalarySlip: RequestHandler = async (req, res) => {
  const { userId } = requireAuth(req);

  // Set by multer when a file was present. Absent means the form was submitted
  // with no file, or with the file under a different field name.
  if (!req.file) {
    throw ApiError.badRequest('Attach a file in a field named "salarySlip"');
  }

  const profile = await borrowerService.saveSalarySlip(userId, req.file);

  res.json({
    success: true,
    message: "Salary slip uploaded",
    data: { profile: profile.toJSON() },
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

export const applyForLoan: RequestHandler = async (req, res) => {
  const { userId } = requireAuth(req);
  const input = applyForLoanSchema.parse(req.body);

  const loan = await loanService.applyForLoan(userId, input);

  res.status(201).json({
    success: true,
    message: "Loan application submitted",
    data: { loan: loan.toJSON() },
  });
};

export const listMyLoans: RequestHandler = async (req, res) => {
  const { userId } = requireAuth(req);
  const loans = await loanService.listLoansForBorrower(userId);

  res.json({
    success: true,
    data: { loans: loans.map((loan) => loan.toJSON()) },
  });
};

export const getMyLoan: RequestHandler = async (req, res) => {
  const { userId } = requireAuth(req);
  const loanId = routeParam(req.params.id, "id");
  const { loan, payments } = await loanService.getLoanForBorrower(userId, loanId);

  res.json({
    success: true,
    data: {
      loan: loan.toJSON(),
      payments: payments.map((payment) => payment.toJSON()),
    },
  });
};
