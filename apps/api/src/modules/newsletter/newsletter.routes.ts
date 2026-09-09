import { Router } from "express";
import { authenticate } from "../../core/security/auth.middleware.js";
import { requireAccountType } from "../../core/security/rbac.middleware.js";
import { newsletterController } from "./newsletter.controller.js";

const router = Router();

// Public newsletter subscription route
router.post("/subscribe", (req, res, next) => {
  newsletterController.subscribe(req, res).catch(next);
});

// Admin subscribers list
router.get("/", authenticate(), requireAccountType("ADMIN", "SUB_ADMIN"), (req, res, next) => {
  newsletterController.list(req, res).catch(next);
});

export const newsletterRoutes = router;
