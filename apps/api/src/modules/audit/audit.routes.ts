import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { auditController } from "./audit.controller.js";
import { auditLogIdParamSchema, auditLogQuerySchema } from "./audit.validation.js";

export const auditRouter = Router();

// Protect all audit endpoints with Authentication & RBAC Permission
auditRouter.use(authenticate());

/**
 * @route GET /audit-logs
 * @desc Retrieves paginated audit logs with search, actor, action, and date filters
 * @access Protected (Requires audit.read permission)
 */
auditRouter.get(
  "/",
  requirePermission("audit.read"),
  validate({ query: auditLogQuerySchema }),
  auditController.getAuditLogs
);

/**
 * @route GET /audit-logs/statistics
 * @desc Retrieves aggregate statistics for audit logging dashboard
 * @access Protected (Requires audit.read permission)
 */
auditRouter.get(
  "/statistics",
  requirePermission("audit.read"),
  auditController.getStatistics
);

/**
 * @route GET /audit-logs/:auditId
 * @desc Retrieves detailed audit log entry by ID
 * @access Protected (Requires audit.read permission)
 */
auditRouter.get(
  "/:auditId",
  requirePermission("audit.read"),
  validate({ params: auditLogIdParamSchema }),
  auditController.getAuditLogById
);
