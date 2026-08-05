import { Router, type RequestHandler } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireModuleAccess } from "../../middleware/authorize";
import { DashboardModule } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { routeParam } from "../../utils/http";
import { getLoanDetail } from "../loans/loan.service";
import { approveLoan, listPendingApplications, rejectLoan } from "./sanction.service";
import { rejectLoanSchema } from "./sanction.validation";

const router = Router();

router.use(authenticate, requireModuleAccess(DashboardModule.SANCTION));

function actorId(req: Parameters<RequestHandler>[0]): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.userId;
}

const listApplications: RequestHandler = async (_req, res) => {
  const loans = await listPendingApplications();
  res.json({ success: true, data: { loans: loans.map((loan) => loan.toJSON()) } });
};

const getApplication: RequestHandler = async (req, res) => {
  const { loan, payments } = await getLoanDetail(routeParam(req.params.id, "id"));
  res.json({
    success: true,
    data: { loan: loan.toJSON(), payments: payments.map((payment) => payment.toJSON()) },
  });
};

const approve: RequestHandler = async (req, res) => {
  const loan = await approveLoan(routeParam(req.params.id, "id"), actorId(req));
  res.json({ success: true, message: "Loan sanctioned", data: { loan: loan.toJSON() } });
};

const reject: RequestHandler = async (req, res) => {
  const { reason } = rejectLoanSchema.parse(req.body);
  const loan = await rejectLoan(routeParam(req.params.id, "id"), actorId(req), reason);
  res.json({ success: true, message: "Loan rejected", data: { loan: loan.toJSON() } });
};

router.get("/applications", listApplications);
router.get("/applications/:id", getApplication);
// PATCH rather than POST: these modify part of an existing loan rather than
// creating anything new.
router.patch("/applications/:id/approve", approve);
router.patch("/applications/:id/reject", reject);

export default router;
