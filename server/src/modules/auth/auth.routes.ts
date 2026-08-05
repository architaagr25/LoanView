import { Router } from "express";
import { login, me, signup } from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

// Public — anyone may create a borrower account or sign in.
router.post("/signup", signup);
router.post("/login", login);

// Returns the signed-in user, letting the frontend restore a session from a
// stored token without trusting anything it kept in the browser.
router.get("/me", authenticate, me);

export default router;
