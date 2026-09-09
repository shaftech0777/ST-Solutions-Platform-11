import { Router } from "express";
import { authenticate } from "../../core/security/auth.middleware.js";
import { requireAccountType } from "../../core/security/rbac.middleware.js";
import { automationController } from "./automation.controller.js";

const router = Router();

// Inbound webhook callback from n8n (verified by HMAC signature / secret header in service)
router.post("/callback", (req, res, next) => {
  automationController.handleCallback(req, res).catch(next);
});

// Admin telemetry and status
router.get("/status", authenticate(), requireAccountType("ADMIN", "SUB_ADMIN"), (req, res, next) => {
  automationController.getStatus(req, res).catch(next);
});

// Admin delivery audit logs
router.get("/logs", authenticate(), requireAccountType("ADMIN", "SUB_ADMIN"), (req, res, next) => {
  automationController.getLogs(req, res).catch(next);
});

// Admin manual test trigger
router.post("/test", authenticate(), requireAccountType("ADMIN", "SUB_ADMIN"), (req, res, next) => {
  automationController.sendTest(req, res).catch(next);
});

export const automationRoutes = router;
