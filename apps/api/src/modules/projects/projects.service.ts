import { ProjectStatus } from "@prisma/client";
import { BusinessError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { eventBus } from "../../core/events/event-bus.js";
import {
  sanitizeProjectDetailResponse,
  sanitizeProjectResponse,
  sanitizeProjectUpdate,
} from "./projects.mapper.js";
import { projectsRepository as defaultProjectsRepository, ProjectsRepository } from "./projects.repository.js";
import {
  CreateProjectInput,
  CreateProjectUpdateInput,
  ProjectDetailResponse,
  ProjectQueryFilters,
  ProjectStatistics,
  ProjectSummaryResponse,
  ProjectUpdateSummary,
  UpdateProjectInput,
  UpdateProjectOwnershipInput,
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
   */
  public async getProjects(filters: ProjectQueryFilters): Promise<{
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
    const { data, meta } = await this.projectsRepository.findAndCount(filters);
    const sanitizedItems = data.map((project) => sanitizeProjectResponse(project));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves detailed project record by ID.
   */
  public async getProjectById(projectId: string): Promise<ProjectDetailResponse> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found", ERROR_CODES.PROJECT_NOT_FOUND);
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
      budget: input.budget !== undefined ? input.budget : null,
      projectStatus: input.projectStatus || ProjectStatus.PENDING,
      startDate: input.startDate ? new Date(input.startDate) : null,
      expectedCompletionDate: input.expectedCompletionDate ? new Date(input.expectedCompletionDate) : null,
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
        clientId: input.clientId,
        assignedManagerId: input.assignedManagerId,
        assignedMemberId: input.assignedMemberId,
      },
    });

    return sanitizeProjectDetailResponse(createdProject);
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
    if (input.budget !== undefined) updateData.budget = input.budget;
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
        assignedManagerId: updatedProject.assignedManagerId,
        assignedMemberId: updatedProject.assignedMemberId,
      },
    });

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
      progressPercentage: input.progressPercentage ?? 0,
      project: { connect: { id: projectId } },
      createdBy: { connect: { id: actor.userId } },
    });

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
        progressPercentage: updateRecord.progressPercentage,
        assignedManagerId: project.assignedManagerId,
        assignedMemberId: project.assignedMemberId,
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
