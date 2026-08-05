import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";

/**
 * Single place where feature modules are attached to the API. Each module owns
 * its own router, so adding one is a single line here.
 */
const router = Router();

router.use("/auth", authRoutes);

export default router;
