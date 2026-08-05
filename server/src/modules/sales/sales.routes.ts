import { Router, type RequestHandler } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireModuleAccess } from "../../middleware/authorize";
import { DashboardModule } from "../../types/enums";
import { listLeads } from "./sales.service";

const router = Router();

router.use(authenticate, requireModuleAccess(DashboardModule.SALES));

const getLeads: RequestHandler = async (_req, res) => {
  const { leads, summary } = await listLeads();
  res.json({ success: true, data: { leads, summary } });
};

router.get("/leads", getLeads);

export default router;
