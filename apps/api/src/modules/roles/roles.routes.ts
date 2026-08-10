import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { rolesController } from "./roles.controller.js";
import {
  assignPermissionsSchema,
  createRoleSchema,
  roleIdParamSchema,
  rolePermissionParamsSchema,
  roleQuerySchema,
  updateRoleSchema,
} from "./roles.validation.js";

export const rolesRouter = Router();

// Protect all role management endpoints with Authentication
rolesRouter.use(authenticate());

/**
 * @route GET /roles
 * @desc List paginated roles with search and user counts
 * @access Protected (Requires roles.read permission or ADMIN)
 */
rolesRouter.get(
  "/",
  requirePermission("roles.read"),
  validate({ query: roleQuerySchema }),
  rolesController.getRoles
);

/**
 * @route GET /roles/:roleId
 * @desc Retrieve role details by ID
 * @access Protected (Requires roles.read permission or ADMIN)
 */
rolesRouter.get(
  "/:roleId",
  requirePermission("roles.read"),
  validate({ params: roleIdParamSchema }),
  rolesController.getRoleById
);

/**
 * @route POST /roles
 * @desc Create a new role
 * @access Protected (Requires roles.create permission or ADMIN)
 */
rolesRouter.post(
  "/",
  requirePermission("roles.create"),
  validate({ body: createRoleSchema }),
  rolesController.createRole
);

/**
 * @route PATCH /roles/:roleId
 * @desc Update an existing role
 * @access Protected (Requires roles.update permission or ADMIN)
 */
rolesRouter.patch(
  "/:roleId",
  requirePermission("roles.update"),
  validate({ params: roleIdParamSchema, body: updateRoleSchema }),
  rolesController.updateRole
);

/**
 * @route DELETE /roles/:roleId
 * @desc Delete a role entity
 * @access Protected (Requires roles.delete permission or ADMIN)
 */
rolesRouter.delete(
  "/:roleId",
  requirePermission("roles.delete"),
  validate({ params: roleIdParamSchema }),
  rolesController.deleteRole
);

/**
 * @route GET /roles/:roleId/permissions
 * @desc Retrieve permissions assigned to a role
 * @access Protected (Requires roles.read permission or ADMIN)
 */
rolesRouter.get(
  "/:roleId/permissions",
  requirePermission("roles.read"),
  validate({ params: roleIdParamSchema }),
  rolesController.getRolePermissions
);

/**
 * @route POST /roles/:roleId/permissions
 * @desc Assign permission(s) to a role
 * @access Protected (Requires roles.manage_permissions permission or ADMIN)
 */
rolesRouter.post(
  "/:roleId/permissions",
  requirePermission("roles.manage_permissions"),
  validate({ params: roleIdParamSchema, body: assignPermissionsSchema }),
  rolesController.assignPermissions
);

/**
 * @route DELETE /roles/:roleId/permissions/:permissionId
 * @desc Remove a permission mapping from a role
 * @access Protected (Requires roles.manage_permissions permission or ADMIN)
 */
rolesRouter.delete(
  "/:roleId/permissions/:permissionId",
  requirePermission("roles.manage_permissions"),
  validate({ params: rolePermissionParamsSchema }),
  rolesController.removePermission
);
