import { Router } from "express";
import { authenticate } from "../../core/security/auth.middleware.js";
import { requireAccountType } from "../../core/security/rbac.middleware.js";
import { contactController } from "./contact.controller.js";

const router = Router();

// Public submission route
router.post("/", (req, res, next) => {
  contactController.submit(req, res).catch(next);
});

// Admin list route
router.get("/", authenticate(), requireAccountType("ADMIN", "SUB_ADMIN"), (req, res, next) => {
  contactController.list(req, res).catch(next);
});

export const contactRoutes = router;
