import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { clientsController } from "./clients.controller.js";
import {
  clientIdParamSchema,
  clientQuerySchema,
  createClientSchema,
  updateClientOwnershipSchema,
  updateClientSchema,
  updateClientStatusSchema,
} from "./clients.validation.js";

export const clientsRouter = Router();

// Protect all client management routes with Authentication
clientsRouter.use(authenticate());

/**
 * @route GET /clients
 * @desc Retrieves paginated list of clients
 * @access Protected (Requires clients.read permission)
 */
clientsRouter.get(
  "/",
  requirePermission("clients.read"),
  validate({ query: clientQuerySchema }),
  clientsController.getClients
);

/**
 * @route GET /clients/statistics
 * @desc Retrieves high-level aggregate statistics for clients
 * @access Protected (Requires clients.read permission)
 */
clientsRouter.get(
  "/statistics",
  requirePermission("clients.read"),
  clientsController.getStatistics
);

/**
 * @route GET /clients/:clientId
 * @desc Retrieves detailed information for a single client
 * @access Protected (Requires clients.read permission)
 */
clientsRouter.get(
  "/:clientId",
  requirePermission("clients.read"),
  validate({ params: clientIdParamSchema }),
  clientsController.getClientById
);

/**
 * @route POST /clients
 * @desc Creates a new client
 * @access Protected (Requires clients.create permission)
 */
clientsRouter.post(
  "/",
  requirePermission("clients.create"),
  validate({ body: createClientSchema }),
  clientsController.createClient
);

/**
 * @route PATCH /clients/:clientId
 * @desc Updates client details
 * @access Protected (Requires clients.update permission)
 */
clientsRouter.patch(
  "/:clientId",
  requirePermission("clients.update"),
  validate({ params: clientIdParamSchema, body: updateClientSchema }),
  clientsController.updateClient
);

/**
 * @route PATCH /clients/:clientId/status
 * @desc Updates client status
 * @access Protected (Requires clients.manage_status permission)
 */
clientsRouter.patch(
  "/:clientId/status",
  requirePermission("clients.manage_status"),
  validate({ params: clientIdParamSchema, body: updateClientStatusSchema }),
  clientsController.updateClientStatus
);

/**
 * @route PATCH /clients/:clientId/owner
 * @desc Assigns or updates client ownership
 * @access Protected (Requires clients.manage_ownership permission)
 */
clientsRouter.patch(
  "/:clientId/owner",
  requirePermission("clients.manage_ownership"),
  validate({ params: clientIdParamSchema, body: updateClientOwnershipSchema }),
  clientsController.updateClientOwnership
);
