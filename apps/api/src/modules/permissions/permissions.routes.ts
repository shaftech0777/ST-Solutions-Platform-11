import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { permissionsController } from "./permissions.controller.js";
import {
  createPermissionSchema,
  permissionIdParamSchema,
  permissionQuerySchema,
  updatePermissionSchema,
} from "./permissions.validation.js";

export const permissionsRouter = Router();

// Protect all permission management endpoints with Authentication
permissionsRouter.use(authenticate());

/**
 * @route GET /permissions
 * @desc List paginated permissions with search and role counts
 * @access Protected (Requires permissions.read permission or ADMIN)
 */
permissionsRouter.get(
  "/",
  requirePermission("permissions.read"),
  validate({ query: permissionQuerySchema }),
  permissionsController.getPermissions
);

/**
 * @route GET /permissions/:permissionId
 * @desc Retrieve permission details by ID
 * @access Protected (Requires permissions.read permission or ADMIN)
 */
permissionsRouter.get(
  "/:permissionId",
  requirePermission("permissions.read"),
  validate({ params: permissionIdParamSchema }),
  permissionsController.getPermissionById
);

/**
 * @route POST /permissions
 * @desc Create a new permission
 * @access Protected (Requires permissions.create permission or ADMIN)
 */
permissionsRouter.post(
  "/",
  requirePermission("permissions.create"),
  validate({ body: createPermissionSchema }),
  permissionsController.createPermission
);

/**
 * @route PATCH /permissions/:permissionId
 * @desc Update an existing permission
 * @access Protected (Requires permissions.update permission or ADMIN)
 */
permissionsRouter.patch(
  "/:permissionId",
  requirePermission("permissions.update"),
  validate({ params: permissionIdParamSchema, body: updatePermissionSchema }),
  permissionsController.updatePermission
);

/**
 * @route DELETE /permissions/:permissionId
 * @desc Delete a permission entity
 * @access Protected (Requires permissions.delete permission or ADMIN)
 */
permissionsRouter.delete(
  "/:permissionId",
  requirePermission("permissions.delete"),
  validate({ params: permissionIdParamSchema }),
  permissionsController.deletePermission
);
