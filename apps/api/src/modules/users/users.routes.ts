import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { usersController } from "./users.controller.js";
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamSchema,
  userQuerySchema,
} from "./users.validation.js";

export const usersRouter = Router();

// Protect all user management endpoints with Authentication
usersRouter.use(authenticate());

/**
 * @route GET /users/meta/ranks
 * @desc Retrieves list of organizational rank levels
 * @access Protected
 */
usersRouter.get(
  "/meta/ranks",
  usersController.getRanks
);

/**
 * @route GET /users/meta/leaderboard
 * @desc Retrieves performance leaderboard
 * @access Protected
 */
usersRouter.get(
  "/meta/leaderboard",
  usersController.getLeaderboard
);

/**
 * @route GET /users
 * @desc Retrieves paginated list of users with search and filter capabilities
 * @access Protected (Requires users.read permission or ADMIN)
 */
usersRouter.get(
  "/",
  requirePermission("users.read"),
  validate({ query: userQuerySchema }),
  usersController.getUsers
);

/**
 * @route GET /users/:id
 * @desc Retrieves single user entity by ID
 * @access Protected (Requires users.read permission or ADMIN)
 */
usersRouter.get(
  "/:id",
  requirePermission("users.read"),
  validate({ params: userIdParamSchema }),
  usersController.getUserById
);

/**
 * @route POST /users
 * @desc Creates a new user record
 * @access Protected (Requires users.create permission or ADMIN)
 */
usersRouter.post(
  "/",
  requirePermission("users.create"),
  validate({ body: createUserSchema }),
  usersController.createUser
);

/**
 * @route PATCH /users/:id
 * @desc Updates non-sensitive user profile attributes
 * @access Protected (Requires users.update permission or ADMIN)
 */
usersRouter.patch(
  "/:id",
  requirePermission("users.update"),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  usersController.updateUser
);

/**
 * @route PATCH /users/:id/status
 * @desc Updates user status (e.g. ACTIVE, SUSPENDED, INACTIVE)
 * @access Protected (Requires users.manage_status permission or ADMIN)
 */
usersRouter.patch(
  "/:id/status",
  requirePermission("users.manage_status"),
  validate({ params: userIdParamSchema, body: updateUserStatusSchema }),
  usersController.updateUserStatus
);

/**
 * @route PATCH /users/:id/role
 * @desc Updates user assigned role or accountType
 * @access Protected (Requires users.manage_role permission or ADMIN)
 */
usersRouter.patch(
  "/:id/role",
  requirePermission("users.manage_role"),
  validate({ params: userIdParamSchema, body: updateUserRoleSchema }),
  usersController.updateUserRole
);

/**
 * @route GET /users/:id/performance
 * @desc Retrieves performance metrics for a user
 * @access Protected
 */
usersRouter.get(
  "/:id/performance",
  validate({ params: userIdParamSchema }),
  usersController.getUserPerformance
);

/**
 * @route PATCH /users/:id/performance
 * @desc Updates performance metrics for a user
 * @access Protected (Supervisor/Admin)
 */
usersRouter.patch(
  "/:id/performance",
  requirePermission("users.update"),
  validate({ params: userIdParamSchema }),
  usersController.updateUserPerformance
);

/**
 * @route POST /users/:id/suspend
 * @desc Suspends a user with an administrative reason
 * @access Protected (Requires users.suspend or users.manage_status permission or ADMIN)
 */
usersRouter.post(
  "/:id/suspend",
  requirePermission("users.manage_status"),
  validate({ params: userIdParamSchema }),
  usersController.suspendUser
);

/**
 * @route POST /users/:id/reactivate
 * @desc Reactivates a suspended user
 * @access Protected (Requires users.manage_status permission or ADMIN)
 */
usersRouter.post(
  "/:id/reactivate",
  requirePermission("users.manage_status"),
  validate({ params: userIdParamSchema }),
  usersController.reactivateUser
);

/**
 * @route DELETE /users/:id
 * @desc Deletes or deactivates a user record
 * @access Protected (Requires users.delete permission or ADMIN)
 */
usersRouter.delete(
  "/:id",
  requirePermission("users.delete"),
  validate({ params: userIdParamSchema }),
  usersController.deleteUser
);
