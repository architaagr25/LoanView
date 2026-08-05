import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import borrowerRoutes from "../modules/borrower/borrower.routes";

/**
 * Single place where feature modules are attached to the API. Each module owns
 * its own router, so adding one is a single line here.
 */
const router = Router();

router.use("/auth", authRoutes);
router.use("/borrower", borrowerRoutes);

export default router;
