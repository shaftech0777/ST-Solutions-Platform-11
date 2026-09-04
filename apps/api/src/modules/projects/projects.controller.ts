import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { projectsService as defaultProjectsService, ProjectsService } from "./projects.service.js";
import {
  CreateProjectInputSchema,
  CreateProjectUpdateInputSchema,
  UpdateProjectInputSchema,
  UpdateProjectOwnershipInputSchema,
  UpdateProjectStatusInputSchema,
  UpdateProjectUpdateInputSchema,
} from "./projects.validation.js";
import { CreateProjectInput, CreateProjectUpdateInput, UpdateProjectStatusInput } from "./projects.types.js";

/**
 * Controller class managing HTTP request handlers for Project operations.
 */
export class ProjectsController {
  private readonly projectsService: ProjectsService;

  constructor(projectsService: ProjectsService = defaultProjectsService) {
    this.projectsService = projectsService;
  }

  /**
   * GET /api/v1/projects
   * Retrieves paginated list of projects with filtering.
   */
  public getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const query = req.query as any;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
          }
        : undefined;
      const result = await this.projectsService.getProjects(query, actor);

      ResponseBuilder.paginated(res, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalRecords: result.pagination.total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/projects/statistics
   * Retrieves high-level aggregate statistics for projects.
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.projectsService.getStatistics();

      ResponseBuilder.success(res, stats, {
        message: "Project statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/projects/:projectId
   * Retrieves detailed project record by ID.
   */
  public getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
          }
        : undefined;
      const project = await this.projectsService.getProjectById(projectId, actor);

      ResponseBuilder.success(res, project, {
        message: "Project details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/projects
   * Creates a new project.
   */
  public createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const body = req.body as CreateProjectInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user?.accountType as AccountType,
      };

      const created = await this.projectsService.createProject(body as CreateProjectInput, actor);

      ResponseBuilder.created(res, created, {
        message: "Project created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/projects/:projectId
   * Updates existing project details.
   */
  public updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body as UpdateProjectInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.projectsService.updateProject(projectId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Project updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/projects/:projectId/status
   * Updates project status.
   */
  public updateProjectStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body as UpdateProjectStatusInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.projectsService.updateProjectStatus(projectId, body as UpdateProjectStatusInput, actor);

      ResponseBuilder.success(res, updated, {
        message: "Project status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/projects/:projectId/owner
   * Updates assigned manager or member for a project.
   */
  public updateProjectOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body as UpdateProjectOwnershipInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.projectsService.updateProjectOwnership(projectId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Project ownership updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/projects/:projectId/updates
   * Retrieves all updates for a project.
   */
  public getProjectUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const updates = await this.projectsService.getProjectUpdates(projectId);

      ResponseBuilder.success(res, updates, {
        message: "Project updates retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/projects/:projectId/updates
   * Creates a new update for a project.
   */
  public createProjectUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body as CreateProjectUpdateInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user?.accountType as AccountType,
      };

      const created = await this.projectsService.createProjectUpdate(projectId, body as CreateProjectUpdateInput, actor);

      ResponseBuilder.created(res, created, {
        message: "Project update created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/projects/:projectId/updates/:updateId
   * Updates an existing project update entry.
   */
  public updateProjectUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId, updateId } = req.params;
      const body = req.body as UpdateProjectUpdateInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.projectsService.updateProjectUpdate(projectId, updateId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Project update modified successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/projects/:projectId/updates/:updateId
   * Deletes a project update entry.
   */
  public deleteProjectUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId, updateId } = req.params;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      await this.projectsService.deleteProjectUpdate(projectId, updateId, actor);

      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/projects/:projectId/modules
   * Retrieves all modules for a project.
   */
  public getProjectModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const modules = await this.projectsService.getProjectModules(projectId);

      ResponseBuilder.success(res, modules, {
        message: "Project modules retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/projects/:projectId/modules
   * Creates a new module for a project.
   */
  public createProjectModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const created = await this.projectsService.createProjectModule(projectId, body, actor);

      ResponseBuilder.created(res, created, {
        message: "Project module created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/projects/:projectId/modules/:moduleId
   * Updates a project module.
   */
  public updateProjectModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId, moduleId } = req.params;
      const body = req.body;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.projectsService.updateProjectModule(projectId, moduleId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Project module updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/projects/:projectId/modules/:moduleId
   * Deletes a project module.
   */
  public deleteProjectModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId, moduleId } = req.params;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      await this.projectsService.deleteProjectModule(projectId, moduleId, actor);

      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/projects/:projectId/modules/reorder
   * Reorders project modules.
   */
  public reorderProjectModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const modules = await this.projectsService.reorderProjectModules(projectId, body, actor);

      ResponseBuilder.success(res, modules, {
        message: "Project modules reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/projects/:projectId
   * Deletes a project record.
   */
  public deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      await this.projectsService.deleteProject(projectId);

      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/projects/:projectId/requirements
   * Retrieves all requirements for a project.
   */
  public getProjectRequirements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const requirements = await this.projectsService.getProjectRequirements(projectId);

      ResponseBuilder.success(res, requirements, {
        message: "Project requirements retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/projects/:projectId/requirements
   * Creates a new project requirement.
   */
  public createProjectRequirement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const body = req.body;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const created = await this.projectsService.createProjectRequirement(projectId, body, actor);

      ResponseBuilder.created(res, created, {
        message: "Project requirement created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/projects/:projectId/requirements/:requirementId
   * Updates an existing project requirement.
   */
  public updateProjectRequirement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId, requirementId } = req.params;
      const body = req.body;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.projectsService.updateProjectRequirement(projectId, requirementId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Project requirement updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/projects/:projectId/requirements/:requirementId
   * Deletes a project requirement.
   */
  public deleteProjectRequirement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { projectId, requirementId } = req.params;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      await this.projectsService.deleteProjectRequirement(projectId, requirementId, actor);

      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const projectsController = new ProjectsController();
