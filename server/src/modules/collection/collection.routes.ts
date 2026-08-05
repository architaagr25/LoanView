import { Router, type RequestHandler } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireModuleAccess } from "../../middleware/authorize";
import { DashboardModule } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { routeParam } from "../../utils/http";
import { getLoanDetail } from "../loans/loan.service";
import { listActiveLoans, recordPayment } from "./collection.service";
import { recordPaymentSchema } from "./collection.validation";

const router = Router();

router.use(authenticate, requireModuleAccess(DashboardModule.COLLECTION));

function actorId(req: Parameters<RequestHandler>[0]): string {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.userId;
}

const listQueue: RequestHandler = async (_req, res) => {
  const loans = await listActiveLoans();
  res.json({ success: true, data: { loans: loans.map((loan) => loan.toJSON()) } });
};

const getLoan: RequestHandler = async (req, res) => {
  const { loan, payments } = await getLoanDetail(routeParam(req.params.id, "id"));
  res.json({
    success: true,
    data: { loan: loan.toJSON(), payments: payments.map((payment) => payment.toJSON()) },
  });
};

const addPayment: RequestHandler = async (req, res) => {
  const input = recordPaymentSchema.parse(req.body);

  const { loan, payment, closed } = await recordPayment(
    routeParam(req.params.id, "id"),
    actorId(req),
    input,
  );

  res.status(201).json({
    success: true,
    message: closed ? "Payment recorded — loan fully repaid and closed" : "Payment recorded",
    data: { loan: loan.toJSON(), payment: payment.toJSON(), closed },
  });
};

router.get("/loans", listQueue);
router.get("/loans/:id", getLoan);
router.post("/loans/:id/payments", addPayment);

export default router;
