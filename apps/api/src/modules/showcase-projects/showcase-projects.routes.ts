import { Router } from "express";
import { authenticate, requirePermission } from "../../middlewares/index.js";
import { showcaseProjectsController } from "./showcase-projects.controller.js";

export const showcaseProjectsRouter = Router();

// ==========================================
// 1. PUBLIC FIXED ENDPOINTS
// ==========================================

/**
 * @route GET /showcase-projects/categories
 * @desc Retrieve showcase project categories
 * @access Public
 */
showcaseProjectsRouter.get("/categories", showcaseProjectsController.getCategories);

/**
 * @route GET /showcase-projects
 * @desc Retrieve published showcase projects
 * @access Public
 */
showcaseProjectsRouter.get("/", showcaseProjectsController.getPublicProjects);

// ==========================================
// 2. PROTECTED ADMINISTRATIVE & ACTION ENDPOINTS
// (Declared BEFORE dynamic :idOrSlug to avoid any interception)
// ==========================================

/**
 * @route GET /showcase-projects/admin/all
 * @desc Retrieve all showcase projects (including DRAFT, ARCHIVED) for management
 * @access Protected (Requires settings.read or Admin)
 */
showcaseProjectsRouter.get(
  "/admin/all",
  authenticate(),
  requirePermission("settings.read"),
  showcaseProjectsController.getAllProjectsAdmin
);

/**
 * @route POST /showcase-projects/reorder
 * @desc Reorder showcase projects
 * @access Protected (Requires settings.update or Admin)
 */
showcaseProjectsRouter.post(
  "/reorder",
  authenticate(),
  requirePermission("settings.update"),
  showcaseProjectsController.reorderProjects
);

/**
 * @route POST /showcase-projects
 * @desc Create a new showcase project
 * @access Protected (Requires settings.update or Admin)
 */
showcaseProjectsRouter.post(
  "/",
  authenticate(),
  requirePermission("settings.update"),
  showcaseProjectsController.createProject
);

/**
 * @route PATCH /showcase-projects/:id
 * @desc Update a showcase project
 * @access Protected (Requires settings.update or Admin)
 */
showcaseProjectsRouter.patch(
  "/:id",
  authenticate(),
  requirePermission("settings.update"),
  showcaseProjectsController.updateProject
);

/**
 * @route DELETE /showcase-projects/:id
 * @desc Delete a showcase project
 * @access Protected (Requires settings.update or Admin)
 */
showcaseProjectsRouter.delete(
  "/:id",
  authenticate(),
  requirePermission("settings.update"),
  showcaseProjectsController.deleteProject
);

// ==========================================
// 3. PUBLIC DYNAMIC ENDPOINTS (Declared LAST)
// ==========================================

/**
 * @route GET /showcase-projects/:idOrSlug
 * @desc Retrieve a single published showcase project by ID or slug
 * @access Public
 */
showcaseProjectsRouter.get("/:idOrSlug", showcaseProjectsController.getPublicProjectByIdOrSlug);
