import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { clientRequestsController } from "./client-requests.controller.js";
import {
  clientRequestIdParamSchema,
  clientRequestQuerySchema,
  convertClientRequestSchema,
  createClientRequestSchema,
  updateClientRequestSchema,
  updateClientRequestStatusSchema,
} from "./client-requests.validation.js";

export const clientRequestsRouter = Router();

/**
 * @route POST /client-requests
 * @desc Submits a new client request / lead intake
 * @access Public / Unprotected (Website lead intake)
 */
clientRequestsRouter.post(
  "/",
  validate({ body: createClientRequestSchema }),
  clientRequestsController.createClientRequest
);

// Protect remaining management endpoints with Authentication
clientRequestsRouter.use(authenticate());

/**
 * @route GET /client-requests
 * @desc Retrieves paginated list of client requests
 * @access Protected (Requires client_requests.read permission)
 */
clientRequestsRouter.get(
  "/",
  requirePermission("client_requests.read"),
  validate({ query: clientRequestQuerySchema }),
  clientRequestsController.getClientRequests
);

/**
 * @route GET /client-requests/statistics
 * @desc Retrieves aggregate statistics for client requests
 * @access Protected (Requires client_requests.read permission)
 */
clientRequestsRouter.get(
  "/statistics",
  requirePermission("client_requests.read"),
  clientRequestsController.getStatistics
);

/**
 * @route GET /client-requests/:requestId
 * @desc Retrieves detailed information for a single client request
 * @access Protected (Requires client_requests.read permission)
 */
clientRequestsRouter.get(
  "/:requestId",
  requirePermission("client_requests.read"),
  validate({ params: clientRequestIdParamSchema }),
  clientRequestsController.getClientRequestById
);

/**
 * @route PATCH /client-requests/:requestId
 * @desc Updates client request details
 * @access Protected (Requires client_requests.update permission)
 */
clientRequestsRouter.patch(
  "/:requestId",
  requirePermission("client_requests.update"),
  validate({ params: clientRequestIdParamSchema, body: updateClientRequestSchema }),
  clientRequestsController.updateClientRequest
);

/**
 * @route PATCH /client-requests/:requestId/status
 * @desc Updates status of a client request
 * @access Protected (Requires client_requests.manage_status permission)
 */
clientRequestsRouter.patch(
  "/:requestId/status",
  requirePermission("client_requests.manage_status"),
  validate({ params: clientRequestIdParamSchema, body: updateClientRequestStatusSchema }),
  clientRequestsController.updateClientRequestStatus
);

/**
 * @route POST /client-requests/:requestId/convert
 * @desc Converts a client request / lead into a Client record
 * @access Protected (Requires client_requests.update or client_requests.create permission)
 */
clientRequestsRouter.post(
  "/:requestId/convert",
  requirePermission("client_requests.update"),
  validate({ params: clientRequestIdParamSchema, body: convertClientRequestSchema }),
  clientRequestsController.convertToClient
);

/**
 * @route DELETE /client-requests/:requestId
 * @desc Deletes a client request record
 * @access Protected (Requires client_requests.delete permission)
 */
clientRequestsRouter.delete(
  "/:requestId",
  requirePermission("client_requests.delete"),
  validate({ params: clientRequestIdParamSchema }),
  clientRequestsController.deleteClientRequest
);
