import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { projectsController } from "./projects.controller.js";
import {
  createProjectSchema,
  createProjectUpdateSchema,
  projectIdParamSchema,
  projectQuerySchema,
  projectUpdateParamsSchema,
  updateProjectOwnershipSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  updateProjectUpdateSchema,
} from "./projects.validation.js";

export const projectsRouter = Router();

// Protect all project management routes with Authentication
projectsRouter.use(authenticate());

/**
 * @route GET /projects
 * @desc Retrieves paginated list of projects
 * @access Protected (Requires projects.read permission)
 */
projectsRouter.get(
  "/",
  requirePermission("projects.read"),
  validate({ query: projectQuerySchema }),
  projectsController.getProjects
);

/**
 * @route GET /projects/statistics
 * @desc Retrieves aggregate statistics for projects
 * @access Protected (Requires projects.read permission)
 */
projectsRouter.get(
  "/statistics",
  requirePermission("projects.read"),
  projectsController.getStatistics
);

/**
 * @route GET /projects/:projectId
 * @desc Retrieves detailed information for a single project
 * @access Protected (Requires projects.read permission)
 */
projectsRouter.get(
  "/:projectId",
  requirePermission("projects.read"),
  validate({ params: projectIdParamSchema }),
  projectsController.getProjectById
);

/**
 * @route POST /projects
 * @desc Creates a new project
 * @access Protected (Requires projects.create permission)
 */
projectsRouter.post(
  "/",
  requirePermission("projects.create"),
  validate({ body: createProjectSchema }),
  projectsController.createProject
);

/**
 * @route PATCH /projects/:projectId
 * @desc Updates project details
 * @access Protected (Requires projects.update permission)
 */
projectsRouter.patch(
  "/:projectId",
  requirePermission("projects.update"),
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  projectsController.updateProject
);

/**
 * @route PATCH /projects/:projectId/status
 * @desc Updates project status
 * @access Protected (Requires projects.manage_status permission)
 */
projectsRouter.patch(
  "/:projectId/status",
  requirePermission("projects.manage_status"),
  validate({ params: projectIdParamSchema, body: updateProjectStatusSchema }),
  projectsController.updateProjectStatus
);

/**
 * @route PATCH /projects/:projectId/owner
 * @desc Updates project assigned manager or member
 * @access Protected (Requires projects.manage_ownership permission)
 */
projectsRouter.patch(
  "/:projectId/owner",
  requirePermission("projects.manage_ownership"),
  validate({ params: projectIdParamSchema, body: updateProjectOwnershipSchema }),
  projectsController.updateProjectOwnership
);

/**
 * @route GET /projects/:projectId/updates
 * @desc Retrieves list of project updates
 * @access Protected (Requires projects.read permission)
 */
projectsRouter.get(
  "/:projectId/updates",
  requirePermission("projects.read"),
  validate({ params: projectIdParamSchema }),
  projectsController.getProjectUpdates
);

/**
 * @route POST /projects/:projectId/updates
 * @desc Creates a new project update
 * @access Protected (Requires projects.manage_updates permission)
 */
projectsRouter.post(
  "/:projectId/updates",
  requirePermission("projects.manage_updates"),
  validate({ params: projectIdParamSchema, body: createProjectUpdateSchema }),
  projectsController.createProjectUpdate
);

/**
 * @route PATCH /projects/:projectId/updates/:updateId
 * @desc Updates an existing project update
 * @access Protected (Requires projects.manage_updates permission)
 */
projectsRouter.patch(
  "/:projectId/updates/:updateId",
  requirePermission("projects.manage_updates"),
  validate({ params: projectUpdateParamsSchema, body: updateProjectUpdateSchema }),
  projectsController.updateProjectUpdate
);

/**
 * @route DELETE /projects/:projectId/updates/:updateId
 * @desc Deletes a project update
 * @access Protected (Requires projects.manage_updates permission)
 */
projectsRouter.delete(
  "/:projectId/updates/:updateId",
  requirePermission("projects.manage_updates"),
  validate({ params: projectUpdateParamsSchema }),
  projectsController.deleteProjectUpdate
);

/**
 * @route DELETE /projects/:projectId
 * @desc Deletes a project
 * @access Protected (Requires projects.delete permission)
 */
projectsRouter.delete(
  "/:projectId",
  requirePermission("projects.delete"),
  validate({ params: projectIdParamSchema }),
  projectsController.deleteProject
);
