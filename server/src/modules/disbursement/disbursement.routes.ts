import { Types } from "mongoose";
import { Router, type RequestHandler } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireModuleAccess } from "../../middleware/authorize";
import { DashboardModule, LoanStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { routeParam } from "../../utils/http";
import { getLoanDetail, listLoansByStatus, transitionLoan } from "../loans/loan.service";

const router = Router();

router.use(authenticate, requireModuleAccess(DashboardModule.DISBURSEMENT));

function actorId(req: Parameters<RequestHandler>[0]): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.userId;
}

/** Sanctioned loans are the ones awaiting release of funds. */
const listQueue: RequestHandler = async (_req, res) => {
  const loans = await listLoansByStatus([LoanStatus.SANCTIONED]);
  res.json({ success: true, data: { loans: loans.map((loan) => loan.toJSON()) } });
};

const getLoan: RequestHandler = async (req, res) => {
  const { loan, payments } = await getLoanDetail(routeParam(req.params.id, "id"));
  res.json({
    success: true,
    data: { loan: loan.toJSON(), payments: payments.map((payment) => payment.toJSON()) },
  });
};

const disburse: RequestHandler = async (req, res) => {
  const actor = actorId(req);

  const loan = await transitionLoan({
    loanId: routeParam(req.params.id, "id"),
    to: LoanStatus.DISBURSED,
    actorId: actor,
    note: "Funds released to borrower",
    apply(record) {
      record.disbursedBy = new Types.ObjectId(actor);
      record.disbursedAt = new Date();
    },
  });

  res.json({ success: true, message: "Loan disbursed", data: { loan: loan.toJSON() } });
};

router.get("/loans", listQueue);
router.get("/loans/:id", getLoan);
router.patch("/loans/:id/disburse", disburse);

export default router;
