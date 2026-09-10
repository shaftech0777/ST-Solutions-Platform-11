import { AccountType, ProjectStatus } from "@prisma/client";
import { BusinessError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { eventBus } from "../../core/events/event-bus.js";
import { clientsRepository } from "../clients/clients.repository.js";
import {
  sanitizeProjectDetailResponse,
  sanitizeProjectModule,
  sanitizeProjectRequirement,
  sanitizeProjectResponse,
  sanitizeProjectUpdate,
} from "./projects.mapper.js";
import { projectsRepository as defaultProjectsRepository, ProjectsRepository } from "./projects.repository.js";
import {
  CreateProjectInput,
  CreateProjectModuleInput,
  CreateProjectRequirementInput,
  CreateProjectUpdateInput,
  ProjectDetailResponse,
  ProjectModuleResponse,
  ProjectQueryFilters,
  ProjectRequirementResponse,
  ProjectStatistics,
  ProjectSummaryResponse,
  ProjectUpdateSummary,
  ReorderProjectModulesInput,
  UpdateProjectInput,
  UpdateProjectModuleInput,
  UpdateProjectOwnershipInput,
  UpdateProjectRequirementInput,
  UpdateProjectStatusInput,
  UpdateProjectUpdateInput,
} from "./projects.types.js";

/**
 * Business logic layer managing Project operations.
 */
export class ProjectsService {
  private readonly projectsRepository: ProjectsRepository;

  constructor(projectsRepository: ProjectsRepository = defaultProjectsRepository) {
    this.projectsRepository = projectsRepository;
  }

  /**
   * Retrieves paginated list of projects with filtering.
   * Enforces strict client portal boundary: CLIENTs can only view their own projects.
   */
  public async getProjects(
    filters: ProjectQueryFilters,
    actor?: { userId: string; accountType?: string }
  ): Promise<{
    items: ProjectSummaryResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const effectiveFilters = { ...filters };

    // Enforce strict client portal boundary: CLIENTs can only view their own projects
    if (actor && actor.accountType === AccountType.CLIENT) {
      const clientRecord = await clientsRepository.findByUserId(actor.userId);
      if (!clientRecord) {
        throw new NotFoundError(
          "Client record not found for the authenticated account",
          ERROR_CODES.CLIENT_NOT_FOUND
        );
      }
      effectiveFilters.clientId = clientRecord.id;
    }

    const { data, meta } = await this.projectsRepository.findAndCount(effectiveFilters);
    const sanitizedItems = data.map((project) => sanitizeProjectResponse(project));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves detailed project record by ID.
   * Enforces strict client portal boundary: CLIENTs can only view their own projects.
   */
  public async getProjectById(
    projectId: string,
    actor?: { userId: string; accountType?: string }
  ): Promise<ProjectDetailResponse> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    if (actor && actor.accountType === AccountType.CLIENT) {
      const clientRecord = await clientsRepository.findByUserId(actor.userId);
      if (!clientRecord || project.clientId !== clientRecord.id) {
        throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
      }
    }

    return sanitizeProjectDetailResponse(project);
  }

  /**
   * Creates a new project and attaches initial ownership if provided.
   */
  public async createProject(
    input: CreateProjectInput,
    actor: { userId: string; accountType?: string }
  ): Promise<ProjectDetailResponse> {
    const client = await this.projectsRepository.findClientById(input.clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.PROJECT_CLIENT_NOT_FOUND);
    }

    if (input.assignedManagerId) {
      const manager = await this.projectsRepository.findUserById(input.assignedManagerId);
      if (!manager) {
        throw new NotFoundError("Assigned manager user not found", ERROR_CODES.PROJECT_MANAGER_NOT_FOUND);
      }
    }

    if (input.assignedMemberId) {
      const member = await this.projectsRepository.findUserById(input.assignedMemberId);
      if (!member) {
        throw new NotFoundError("Assigned member user not found", ERROR_CODES.PROJECT_MEMBER_NOT_FOUND);
      }
    }

    const createdProject = await this.projectsRepository.create({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category?.trim() || null,
      currency: input.currency?.trim() || "USD",
      budget: input.budget !== undefined ? input.budget : null,
      progressPercentage: input.progressPercentage !== undefined ? input.progressPercentage : 0,
      stagingUrl: input.stagingUrl?.trim() || null,
      productionUrl: input.productionUrl?.trim() || null,
      repositoryUrl: input.repositoryUrl?.trim() || null,
      figmaUrl: input.figmaUrl?.trim() || null,
      documentationUrl: input.documentationUrl?.trim() || null,
      projectStatus: input.projectStatus || ProjectStatus.PENDING,
      startDate: input.startDate ? new Date(input.startDate) : null,
      expectedCompletionDate: input.expectedCompletionDate ? new Date(input.expectedCompletionDate) : null,
      organization: input.organizationId ? { connect: { id: input.organizationId } } : undefined,
      workspace: input.workspaceId ? { connect: { id: input.workspaceId } } : undefined,
      client: { connect: { id: input.clientId } },
      createdBy: { connect: { id: actor.userId } },
      manager: input.assignedManagerId ? { connect: { id: input.assignedManagerId } } : undefined,
      member: input.assignedMemberId ? { connect: { id: input.assignedMemberId } } : undefined,
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_CREATED,
      entityType: "PROJECT",
      entityId: createdProject.id,
      actorId: actor.userId,
      timestamp: new Date(),
      payload: {
        projectId: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        category: createdProject.category,
        budget: createdProject.budget,
        currency: createdProject.currency,
        projectStatus: createdProject.projectStatus,
        clientId: input.clientId,
        clientName: createdProject.client.fullName,
        clientEmail: createdProject.client.email,
        companyName: createdProject.client.companyName,
        assignedManagerId: input.assignedManagerId,
        assignedMemberId: input.assignedMemberId,
      },
    });

    if (createdProject.projectStatus === ProjectStatus.IN_PROGRESS) {
      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PROJECT_STARTED,
        entityType: "PROJECT",
        entityId: createdProject.id,
        actorId: actor.userId,
        timestamp: new Date(),
        payload: {
          projectId: createdProject.id,
          title: createdProject.title,
          clientId: createdProject.client.id,
          clientName: createdProject.client.fullName,
          clientEmail: createdProject.client.email,
          startDate: createdProject.startDate || new Date(),
          assignedManagerId: input.assignedManagerId,
          assignedMemberId: input.assignedMemberId,
        },
      });
    }

    return sanitizeProjectDetailResponse(createdProject);
  }

  /**
   * Deterministically calculates project progress percentage from modules and requirements:
   * - If project has modules AND requirements:
   *     overall progress = Math.round((averageModuleProgress + requirementProgress) / 2)
   *     (Balanced 50% modules / 50% requirements weighting without double-counting)
   * - If project has modules only:
   *     overall progress = Math.round(averageModuleProgress)
   * - If project has requirements only:
   *     overall progress = Math.round(completedRequirements / totalRequirements * 100)
   * - If 0 modules and 0 requirements:
   *     overall progress = 0%
   *
   * Completion rules:
   * - Module progress: clamped 0-100%. If module.status === "COMPLETED", counts as 100%.
   * - Requirement progress: requirement counts as completed ONLY if isCompleted === true OR status === "COMPLETED".
   *   Blocked ("BLOCKED"), pending ("PENDING"), or in-progress ("IN_PROGRESS") items do NOT count as completed.
   */
  public calculateProgress(
    modules: Array<{ progressPercentage?: number | null; status?: string | null }>,
    requirements: Array<{ isCompleted?: boolean | null; status?: string | null }>
  ): number {
    const hasModules = modules.length > 0;
    const hasRequirements = requirements.length > 0;

    if (!hasModules && !hasRequirements) {
      return 0;
    }

    let moduleProgress = 0;
    if (hasModules) {
      const totalScore = modules.reduce((sum, mod) => {
        if (mod.status === "COMPLETED") return sum + 100;
        const clamped = Math.min(100, Math.max(0, mod.progressPercentage ?? 0));
        return sum + clamped;
      }, 0);
      moduleProgress = totalScore / modules.length;
    }

    let requirementProgress = 0;
    if (hasRequirements) {
      const completedCount = requirements.filter(
        (req) => req.isCompleted === true || req.status === "COMPLETED"
      ).length;
      requirementProgress = (completedCount / requirements.length) * 100;
    }

    if (hasModules && hasRequirements) {
      return Math.min(100, Math.max(0, Math.round((moduleProgress + requirementProgress) / 2)));
    }

    if (hasModules) {
      return Math.min(100, Math.max(0, Math.round(moduleProgress)));
    }

    return Math.min(100, Math.max(0, Math.round(requirementProgress)));
  }

  /**
   * Recomputes and persists dynamic project progress derived from modules and requirements.
   */
  public async syncProjectProgress(projectId: string): Promise<number> {
    const [modules, requirements] = await Promise.all([
      this.projectsRepository.findProjectModules(projectId),
      this.projectsRepository.findProjectRequirements(projectId),
    ]);

    const calculatedProgress = this.calculateProgress(modules, requirements);
    await this.projectsRepository.updateProgress(projectId, calculatedProgress);
    return calculatedProgress;
  }

  /**
   * Updates an existing project profile.
   */
  public async updateProject(
    projectId: string,
    input: UpdateProjectInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectDetailResponse> {
    const existingProject = await this.projectsRepository.findById(projectId);
    if (!existingProject) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.category !== undefined) updateData.category = input.category?.trim() || null;
    if (input.currency !== undefined) updateData.currency = input.currency?.trim() || "USD";
    if (input.budget !== undefined) updateData.budget = input.budget;

    // Enforce dynamic progress consistency: if modules or requirements exist, derive progress from source records
    const [modules, requirements] = await Promise.all([
      this.projectsRepository.findProjectModules(projectId),
      this.projectsRepository.findProjectRequirements(projectId),
    ]);
    if (modules.length > 0 || requirements.length > 0) {
      updateData.progressPercentage = this.calculateProgress(modules, requirements);
    } else if (input.progressPercentage !== undefined) {
      updateData.progressPercentage = 0;
    }
    if (input.stagingUrl !== undefined) updateData.stagingUrl = input.stagingUrl?.trim() || null;
    if (input.productionUrl !== undefined) updateData.productionUrl = input.productionUrl?.trim() || null;
    if (input.repositoryUrl !== undefined) updateData.repositoryUrl = input.repositoryUrl?.trim() || null;
    if (input.figmaUrl !== undefined) updateData.figmaUrl = input.figmaUrl?.trim() || null;
    if (input.documentationUrl !== undefined) updateData.documentationUrl = input.documentationUrl?.trim() || null;
    if (input.startDate !== undefined) updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.expectedCompletionDate !== undefined)
      updateData.expectedCompletionDate = input.expectedCompletionDate ? new Date(input.expectedCompletionDate) : null;
    if (input.completedDate !== undefined)
      updateData.completedDate = input.completedDate ? new Date(input.completedDate) : null;

    if (input.clientId !== undefined && input.clientId !== existingProject.clientId) {
      const client = await this.projectsRepository.findClientById(input.clientId);
      if (!client) {
        throw new NotFoundError("Client not found", ERROR_CODES.PROJECT_CLIENT_NOT_FOUND);
      }
      updateData.client = { connect: { id: input.clientId } };
    }

    if (input.assignedManagerId !== undefined) {
      if (input.assignedManagerId === null) {
        updateData.manager = { disconnect: true };
      } else {
        const manager = await this.projectsRepository.findUserById(input.assignedManagerId);
        if (!manager) {
          throw new NotFoundError("Assigned manager user not found", ERROR_CODES.PROJECT_MANAGER_NOT_FOUND);
        }
        updateData.manager = { connect: { id: input.assignedManagerId } };
      }
    }

    if (input.assignedMemberId !== undefined) {
      if (input.assignedMemberId === null) {
        updateData.member = { disconnect: true };
      } else {
        const member = await this.projectsRepository.findUserById(input.assignedMemberId);
        if (!member) {
          throw new NotFoundError("Assigned member user not found", ERROR_CODES.PROJECT_MEMBER_NOT_FOUND);
        }
        updateData.member = { connect: { id: input.assignedMemberId } };
      }
    }

    const updatedProject = await this.projectsRepository.update(projectId, updateData);
    return sanitizeProjectDetailResponse(updatedProject);
  }

  /**
   * Managed transition of project status.
   */
  public async updateProjectStatus(
    projectId: string,
    input: UpdateProjectStatusInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectDetailResponse> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const currentStatus = project.projectStatus;
    const newStatus = input.projectStatus;

    if (currentStatus === newStatus) {
      return sanitizeProjectDetailResponse(project);
    }

    const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.PENDING]: [ProjectStatus.DISCUSSION, ProjectStatus.CONFIRMED, ProjectStatus.CANCELLED],
      [ProjectStatus.DISCUSSION]: [ProjectStatus.CONFIRMED, ProjectStatus.PENDING, ProjectStatus.CANCELLED],
      [ProjectStatus.CONFIRMED]: [ProjectStatus.IN_PROGRESS, ProjectStatus.DISCUSSION, ProjectStatus.CANCELLED],
      [ProjectStatus.IN_PROGRESS]: [ProjectStatus.REVIEW, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      [ProjectStatus.REVIEW]: [ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      [ProjectStatus.COMPLETED]: [ProjectStatus.IN_PROGRESS],
      [ProjectStatus.CANCELLED]: [ProjectStatus.PENDING, ProjectStatus.DISCUSSION, ProjectStatus.CONFIRMED],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BusinessError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        ERROR_CODES.PROJECT_STATUS_TRANSITION_INVALID
      );
    }

    const updateData: any = { projectStatus: newStatus };
    if (newStatus === ProjectStatus.COMPLETED && !project.completedDate) {
      updateData.completedDate = new Date();
    }

    const updatedProject = await this.projectsRepository.update(projectId, updateData);

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_STATUS_CHANGED,
      entityType: "PROJECT",
      entityId: projectId,
      actorId: _actor?.userId,
      timestamp: new Date(),
      payload: {
        projectId,
        title: updatedProject.title,
        previousStatus: currentStatus,
        newStatus,
        clientId: updatedProject.client.id,
        clientName: updatedProject.client.fullName,
        clientEmail: updatedProject.client.email,
        assignedManagerId: updatedProject.assignedManagerId,
        assignedMemberId: updatedProject.assignedMemberId,
      },
    });

    if (newStatus === ProjectStatus.IN_PROGRESS) {
      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PROJECT_STARTED,
        entityType: "PROJECT",
        entityId: projectId,
        actorId: _actor?.userId,
        timestamp: new Date(),
        payload: {
          projectId,
          title: updatedProject.title,
          clientId: updatedProject.client.id,
          clientName: updatedProject.client.fullName,
          clientEmail: updatedProject.client.email,
          startDate: updatedProject.startDate || new Date(),
          assignedManagerId: updatedProject.assignedManagerId,
          assignedMemberId: updatedProject.assignedMemberId,
        },
      });
    }

    if (newStatus === ProjectStatus.COMPLETED) {
      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PROJECT_COMPLETED,
        entityType: "PROJECT",
        entityId: projectId,
        actorId: _actor?.userId,
        timestamp: new Date(),
        payload: {
          projectId,
          title: updatedProject.title,
          clientId: updatedProject.client.id,
          clientName: updatedProject.client.fullName,
          clientEmail: updatedProject.client.email,
          completedDate: updatedProject.completedDate || new Date(),
          productionUrl: updatedProject.productionUrl,
          assignedManagerId: updatedProject.assignedManagerId,
          assignedMemberId: updatedProject.assignedMemberId,
        },
      });
    }

    return sanitizeProjectDetailResponse(updatedProject);
  }

  /**
   * Updates assigned manager or assigned member for a project.
   */
  public async updateProjectOwnership(
    projectId: string,
    input: UpdateProjectOwnershipInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectDetailResponse> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const updateData: any = {};

    if (input.assignedManagerId !== undefined) {
      if (input.assignedManagerId === null) {
        updateData.manager = { disconnect: true };
      } else {
        const manager = await this.projectsRepository.findUserById(input.assignedManagerId);
        if (!manager) {
          throw new NotFoundError("Assigned manager user not found", ERROR_CODES.PROJECT_MANAGER_NOT_FOUND);
        }
        updateData.manager = { connect: { id: input.assignedManagerId } };
      }
    }

    if (input.assignedMemberId !== undefined) {
      if (input.assignedMemberId === null) {
        updateData.member = { disconnect: true };
      } else {
        const member = await this.projectsRepository.findUserById(input.assignedMemberId);
        if (!member) {
          throw new NotFoundError("Assigned member user not found", ERROR_CODES.PROJECT_MEMBER_NOT_FOUND);
        }
        updateData.member = { connect: { id: input.assignedMemberId } };
      }
    }

    const updatedProject = await this.projectsRepository.update(projectId, updateData);
    return sanitizeProjectDetailResponse(updatedProject);
  }

  /**
   * Retrieves list of project updates.
   */
  public async getProjectUpdates(projectId: string): Promise<ProjectUpdateSummary[]> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const updates = await this.projectsRepository.findProjectUpdatesByProjectId(projectId);
    return updates.map(sanitizeProjectUpdate);
  }

  /**
   * Creates a new progress update for a project.
   */
  public async createProjectUpdate(
    projectId: string,
    input: CreateProjectUpdateInput,
    actor: { userId: string; accountType?: string }
  ): Promise<ProjectUpdateSummary> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const updateRecord = await this.projectsRepository.createProjectUpdate({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      updateType: input.updateType?.trim() || "DAILY_UPDATE",
      blockers: input.blockers?.trim() || null,
      nextSteps: input.nextSteps?.trim() || null,
      progressPercentage: input.progressPercentage ?? 0,
      project: { connect: { id: projectId } },
      createdBy: { connect: { id: actor.userId } },
    });

    // Also update project's overall progress percentage if update has higher or latest progress
    if (input.progressPercentage !== undefined) {
      await this.projectsRepository.update(projectId, {
        progressPercentage: input.progressPercentage,
      });
    }

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_UPDATE_CREATED,
      entityType: "PROJECT",
      entityId: projectId,
      actorId: actor.userId,
      timestamp: new Date(),
      payload: {
        projectId,
        projectTitle: project.title,
        updateId: updateRecord.id,
        updateTitle: updateRecord.title,
        updateType: updateRecord.updateType,
        description: updateRecord.description,
        blockers: updateRecord.blockers,
        nextSteps: updateRecord.nextSteps,
        progressPercentage: updateRecord.progressPercentage,
        clientId: project.client.id,
        clientName: project.client.fullName,
        clientEmail: project.client.email,
        assignedManagerId: project.assignedManagerId,
        assignedMemberId: project.assignedMemberId,
      },
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_PROGRESS_UPDATED,
      entityType: "PROJECT",
      entityId: projectId,
      actorId: actor.userId,
      timestamp: new Date(),
      payload: {
        projectId,
        projectTitle: project.title,
        progressPercentage: updateRecord.progressPercentage,
        milestoneTitle: updateRecord.title,
        updateType: updateRecord.updateType,
        summary: updateRecord.description,
        nextSteps: updateRecord.nextSteps,
        clientId: project.client.id,
        clientName: project.client.fullName,
        clientEmail: project.client.email,
      },
    });

    return sanitizeProjectUpdate(updateRecord);
  }

  /**
   * Updates an existing project update entry.
   */
  public async updateProjectUpdate(
    projectId: string,
    updateId: string,
    input: UpdateProjectUpdateInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectUpdateSummary> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingUpdate = await this.projectsRepository.findProjectUpdateById(updateId);
    if (!existingUpdate || existingUpdate.projectId !== projectId) {
      throw new NotFoundError("Project update record not found", ERROR_CODES.PROJECT_UPDATE_NOT_FOUND);
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.updateType !== undefined) updateData.updateType = input.updateType?.trim() || "DAILY_UPDATE";
    if (input.blockers !== undefined) updateData.blockers = input.blockers?.trim() || null;
    if (input.nextSteps !== undefined) updateData.nextSteps = input.nextSteps?.trim() || null;
    if (input.progressPercentage !== undefined) updateData.progressPercentage = input.progressPercentage;

    const updated = await this.projectsRepository.updateProjectUpdate(updateId, updateData);
    return sanitizeProjectUpdate(updated);
  }

  /**
   * Deletes a project update entry.
   */
  public async deleteProjectUpdate(
    projectId: string,
    updateId: string,
    _actor?: { userId: string; accountType?: string }
  ): Promise<void> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingUpdate = await this.projectsRepository.findProjectUpdateById(updateId);
    if (!existingUpdate || existingUpdate.projectId !== projectId) {
      throw new NotFoundError("Project update record not found", ERROR_CODES.PROJECT_UPDATE_NOT_FOUND);
    }

    await this.projectsRepository.deleteProjectUpdate(updateId);
  }

  /**
   * Retrieves all modules for a project.
   */
  public async getProjectModules(projectId: string): Promise<ProjectModuleResponse[]> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const modules = await this.projectsRepository.findProjectModules(projectId);
    return modules.map(sanitizeProjectModule);
  }

  /**
   * Creates a new module within a project.
   */
  public async createProjectModule(
    projectId: string,
    input: CreateProjectModuleInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectModuleResponse> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingModules = await this.projectsRepository.findProjectModules(projectId);
    const nextOrder = input.orderIndex !== undefined ? input.orderIndex : existingModules.length;

    const moduleRecord = await this.projectsRepository.createProjectModule({
      projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      orderIndex: nextOrder,
      status: input.status || "PENDING",
      progressPercentage: input.progressPercentage ?? 0,
      startDate: input.startDate ? new Date(input.startDate) : null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    });

    await this.syncProjectProgress(projectId);
    return sanitizeProjectModule(moduleRecord);
  }

  /**
   * Updates an existing project module.
   */
  public async updateProjectModule(
    projectId: string,
    moduleId: string,
    input: UpdateProjectModuleInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectModuleResponse> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingModule = await this.projectsRepository.findProjectModuleById(moduleId);
    if (!existingModule || existingModule.projectId !== projectId) {
      throw new NotFoundError("Project module not found", ERROR_CODES.PROJECT_MODULE_NOT_FOUND);
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === "COMPLETED" && !existingModule.completedAt) {
        updateData.completedAt = new Date();
      }
    }
    if (input.progressPercentage !== undefined) updateData.progressPercentage = input.progressPercentage;
    if (input.startDate !== undefined) updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.targetDate !== undefined) updateData.targetDate = input.targetDate ? new Date(input.targetDate) : null;
    if (input.completedAt !== undefined) updateData.completedAt = input.completedAt ? new Date(input.completedAt) : null;

    const updated = await this.projectsRepository.updateProjectModule(moduleId, updateData);
    await this.syncProjectProgress(projectId);
    return sanitizeProjectModule(updated);
  }

  /**
   * Deletes a project module.
   */
  public async deleteProjectModule(
    projectId: string,
    moduleId: string,
    _actor?: { userId: string; accountType?: string }
  ): Promise<void> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingModule = await this.projectsRepository.findProjectModuleById(moduleId);
    if (!existingModule || existingModule.projectId !== projectId) {
      throw new NotFoundError("Project module not found", ERROR_CODES.PROJECT_MODULE_NOT_FOUND);
    }

    await this.projectsRepository.deleteProjectModule(moduleId);
    await this.syncProjectProgress(projectId);
  }

  /**
   * Reorders modules of a project.
   */
  public async reorderProjectModules(
    projectId: string,
    input: ReorderProjectModulesInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectModuleResponse[]> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const reordered = await this.projectsRepository.reorderProjectModules(projectId, input.modules);
    await this.syncProjectProgress(projectId);
    return reordered.map(sanitizeProjectModule);
  }

  /**
   * Retrieves all requirements for a project.
   */
  public async getProjectRequirements(projectId: string): Promise<ProjectRequirementResponse[]> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const requirements = await this.projectsRepository.findProjectRequirements(projectId);
    return requirements.map(sanitizeProjectRequirement);
  }

  /**
   * Creates a new requirement for a project.
   */
  public async createProjectRequirement(
    projectId: string,
    input: CreateProjectRequirementInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectRequirementResponse> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const created = await this.projectsRepository.createProjectRequirement({
      projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority || "MEDIUM",
      status: input.status || "PENDING",
      isCompleted: input.isCompleted ?? false,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      completedAt: input.isCompleted ? new Date() : null,
    });

    await this.syncProjectProgress(projectId);
    return sanitizeProjectRequirement(created);
  }

  /**
   * Updates an existing project requirement.
   */
  public async updateProjectRequirement(
    projectId: string,
    requirementId: string,
    input: UpdateProjectRequirementInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<ProjectRequirementResponse> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingRequirement = await this.projectsRepository.findProjectRequirementById(requirementId);
    if (!existingRequirement || existingRequirement.projectId !== projectId) {
      throw new NotFoundError("Project requirement not found", ERROR_CODES.PROJECT_REQUIREMENT_NOT_FOUND);
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === "COMPLETED") {
        updateData.isCompleted = true;
        if (!existingRequirement.completedAt) updateData.completedAt = new Date();
      }
    }
    if (input.isCompleted !== undefined) {
      updateData.isCompleted = input.isCompleted;
      if (input.isCompleted) {
        updateData.status = "COMPLETED";
        if (!existingRequirement.completedAt) updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
        if (existingRequirement.status === "COMPLETED") {
          updateData.status = "IN_PROGRESS";
        }
      }
    }
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.completedAt !== undefined) updateData.completedAt = input.completedAt ? new Date(input.completedAt) : null;

    const updated = await this.projectsRepository.updateProjectRequirement(requirementId, updateData);
    await this.syncProjectProgress(projectId);
    return sanitizeProjectRequirement(updated);
  }

  /**
   * Deletes a project requirement.
   */
  public async deleteProjectRequirement(
    projectId: string,
    requirementId: string,
    _actor?: { userId: string; accountType?: string }
  ): Promise<void> {
    const projectExists = await this.projectsRepository.exists(projectId);
    if (!projectExists) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    const existingRequirement = await this.projectsRepository.findProjectRequirementById(requirementId);
    if (!existingRequirement || existingRequirement.projectId !== projectId) {
      throw new NotFoundError("Project requirement not found", ERROR_CODES.PROJECT_REQUIREMENT_NOT_FOUND);
    }

    await this.projectsRepository.deleteProjectRequirement(requirementId);
    await this.syncProjectProgress(projectId);
  }

  /**
   * Deletes a project by ID.
   */
  public async deleteProject(projectId: string): Promise<void> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
    }

    await this.projectsRepository.delete(projectId);
  }

  /**
   * Computes aggregate statistics for projects.
   */
  public async getStatistics(): Promise<ProjectStatistics> {
    return this.projectsRepository.getStatistics();
  }
}

export const projectsService = new ProjectsService();
