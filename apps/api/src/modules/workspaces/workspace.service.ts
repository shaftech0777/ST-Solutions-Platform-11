import { AuthorizationError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { domainEventBus } from "../../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { organizationRepository as defaultOrgRepository, OrganizationRepository } from "../organizations/organization.repository.js";
import { workspaceRepository as defaultWorkspaceRepo, WorkspaceRepository } from "./workspace.repository.js";
import { AddWorkspaceMemberInput, CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.validation.js";

export class WorkspaceService {
  private readonly workspaceRepo: WorkspaceRepository;
  private readonly orgRepo: OrganizationRepository;

  constructor(
    workspaceRepo: WorkspaceRepository = defaultWorkspaceRepo,
    orgRepo: OrganizationRepository = defaultOrgRepository
  ) {
    this.workspaceRepo = workspaceRepo;
    this.orgRepo = orgRepo;
  }

  public async createWorkspace(userId: string, dto: CreateWorkspaceInput) {
    const orgMember = await this.orgRepo.getMember(dto.organizationId, userId);
    if (!orgMember) {
      throw new AuthorizationError(
        "Access denied: You are not a member of this organization",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    const slugBase = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const workspace = await this.workspaceRepo.create({
      organizationId: dto.organizationId,
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim(),
      creatorId: userId,
    });

    await domainEventBus.publish({
      eventName: DOMAIN_EVENTS.WORKSPACE_CREATED,
      entityType: "Workspace",
      entityId: workspace.id,
      actorId: userId,
      timestamp: new Date(),
      payload: {
        workspaceId: workspace.id,
        organizationId: dto.organizationId,
        name: workspace.name,
      },
    });

    return workspace;
  }

  public async getOrganizationWorkspaces(organizationId: string, userId: string) {
    const orgMember = await this.orgRepo.getMember(organizationId, userId);
    if (!orgMember) {
      throw new AuthorizationError(
        "Access denied: You are not a member of this organization",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    return this.workspaceRepo.findByOrganization(organizationId);
  }

  public async getWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError(`Workspace with ID '${workspaceId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
    }

    const orgMember = await this.orgRepo.getMember(workspace.organizationId, userId);
    if (!orgMember) {
      throw new AuthorizationError(
        "Access denied: You do not have access to this workspace",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    return workspace;
  }

  public async updateWorkspace(workspaceId: string, userId: string, dto: UpdateWorkspaceInput) {
    const workspace = await this.getWorkspaceById(workspaceId, userId);

    return this.workspaceRepo.update(workspace.id, {
      name: dto.name?.trim(),
      description: dto.description?.trim(),
      isArchived: dto.isArchived,
    });
  }

  public async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.getWorkspaceById(workspaceId, userId);
    await this.workspaceRepo.delete(workspace.id);
    return { message: "Workspace deleted successfully" };
  }

  public async addMember(workspaceId: string, actorUserId: string, dto: AddWorkspaceMemberInput) {
    const workspace = await this.getWorkspaceById(workspaceId, actorUserId);
    return this.workspaceRepo.addMember(workspace.id, dto.userId, dto.role);
  }
}

export const workspaceService = new WorkspaceService();
