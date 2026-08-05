import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { downloadFile } from "./files.controller";

const router = Router();

// Authenticated for everyone; the per-file ownership check lives in the
// handler, because who may read a file depends on the file, not on the route.
router.get("/:id", authenticate, downloadFile);

export default router;
