import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/authorize";
import { UserRole } from "../../types/enums";
import { salarySlipUpload } from "../../middleware/upload";
import { getProfile, submitProfile, uploadSalarySlip } from "./borrower.controller";

const router = Router();

// Applied to every route in this module. Guarding the router rather than each
// route means a route added later is protected by default — the failure mode is
// an accidental 403, not an accidentally public endpoint.
router.use(authenticate, requireRole(UserRole.BORROWER));

router.get("/profile", getProfile);
router.post("/profile", submitProfile);

router.post("/salary-slip", salarySlipUpload, uploadSalarySlip);

export default router;
