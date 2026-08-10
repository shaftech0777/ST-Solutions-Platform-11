import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { paymentsController } from "./payments.controller.js";
import {
  createPaymentSchema,
  paymentIdParamSchema,
  paymentQuerySchema,
  updatePaymentSchema,
  updatePaymentStatusSchema,
} from "./payments.validation.js";

export const paymentsRouter = Router();

// Protect all payment management routes with Authentication
paymentsRouter.use(authenticate());

/**
 * @route GET /payments
 * @desc Retrieves paginated list of payments
 * @access Protected (Requires payments.read permission)
 */
paymentsRouter.get(
  "/",
  requirePermission("payments.read"),
  validate({ query: paymentQuerySchema }),
  paymentsController.getPayments
);

/**
 * @route GET /payments/statistics
 * @desc Retrieves aggregate statistics for payments & financials
 * @access Protected (Requires payments.read permission)
 */
paymentsRouter.get(
  "/statistics",
  requirePermission("payments.read"),
  paymentsController.getStatistics
);

/**
 * @route GET /payments/:paymentId
 * @desc Retrieves detailed information for a single payment
 * @access Protected (Requires payments.read permission)
 */
paymentsRouter.get(
  "/:paymentId",
  requirePermission("payments.read"),
  validate({ params: paymentIdParamSchema }),
  paymentsController.getPaymentById
);

/**
 * @route POST /payments
 * @desc Creates a new payment record
 * @access Protected (Requires payments.create permission)
 */
paymentsRouter.post(
  "/",
  requirePermission("payments.create"),
  validate({ body: createPaymentSchema }),
  paymentsController.createPayment
);

/**
 * @route PATCH /payments/:paymentId
 * @desc Updates payment details
 * @access Protected (Requires payments.update permission)
 */
paymentsRouter.patch(
  "/:paymentId",
  requirePermission("payments.update"),
  validate({ params: paymentIdParamSchema, body: updatePaymentSchema }),
  paymentsController.updatePayment
);

/**
 * @route PATCH /payments/:paymentId/status
 * @desc Updates payment status
 * @access Protected (Requires payments.manage_status permission)
 */
paymentsRouter.patch(
  "/:paymentId/status",
  requirePermission("payments.manage_status"),
  validate({ params: paymentIdParamSchema, body: updatePaymentStatusSchema }),
  paymentsController.updatePaymentStatus
);

/**
 * @route DELETE /payments/:paymentId
 * @desc Deletes a payment record
 * @access Protected (Requires payments.delete permission)
 */
paymentsRouter.delete(
  "/:paymentId",
  requirePermission("payments.delete"),
  validate({ params: paymentIdParamSchema }),
  paymentsController.deletePayment
);
