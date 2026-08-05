import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import borrowerRoutes from "../modules/borrower/borrower.routes";
import fileRoutes from "../modules/files/files.routes";
import salesRoutes from "../modules/sales/sales.routes";
import sanctionRoutes from "../modules/sanction/sanction.routes";
import disbursementRoutes from "../modules/disbursement/disbursement.routes";
import collectionRoutes from "../modules/collection/collection.routes";

/**
 * Single place where feature modules are attached to the API. Each module owns
 * its own router, so adding one is a single line here.
 */
const router = Router();

router.use("/auth", authRoutes);
router.use("/borrower", borrowerRoutes);
router.use("/files", fileRoutes);

// One router per dashboard module, each guarded by its own module check.
router.use("/sales", salesRoutes);
router.use("/sanction", sanctionRoutes);
router.use("/disbursement", disbursementRoutes);
router.use("/collection", collectionRoutes);

export default router;
