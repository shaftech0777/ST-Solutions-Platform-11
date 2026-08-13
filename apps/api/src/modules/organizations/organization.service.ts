import crypto from "node:crypto";
import { InvitationStatus, OrganizationRole, OrganizationStatus } from "@prisma/client";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { domainEventBus } from "../../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { organizationRepository as defaultOrgRepository, OrganizationRepository } from "./organization.repository.js";
import {
  AcceptInvitationInput,
  CreateOrganizationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "./organization.validation.js";

export class OrganizationService {
  private readonly orgRepository: OrganizationRepository;

  constructor(orgRepository: OrganizationRepository = defaultOrgRepository) {
    this.orgRepository = orgRepository;
  }

  public async createOrganization(userId: string, dto: CreateOrganizationInput) {
    const slugBase = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const organization = await this.orgRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim(),
      ownerId: userId,
    });

    await domainEventBus.publish({
      eventName: DOMAIN_EVENTS.ORGANIZATION_CREATED,
      entityType: "Organization",
      entityId: organization.id,
      actorId: userId,
      timestamp: new Date(),
      payload: {
        organizationId: organization.id,
        name: organization.name,
        ownerId: userId,
      },
    });

    return organization;
  }

  public async getUserOrganizations(userId: string) {
    return this.orgRepository.findUserOrganizations(userId);
  }

  public async getOrganizationById(organizationId: string, userId: string) {
    const member = await this.orgRepository.getMember(organizationId, userId);
    if (!member) {
      throw new AuthorizationError(
        "Access denied: You are not a member of this organization",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    const organization = await this.orgRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError(`Organization with ID '${organizationId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
    }

    return organization;
  }

  public async updateOrganization(organizationId: string, userId: string, dto: UpdateOrganizationInput) {
    const member = await this.orgRepository.getMember(organizationId, userId);
    if (!member || (member.role !== OrganizationRole.OWNER && member.role !== OrganizationRole.ADMIN)) {
      throw new AuthorizationError(
        "Access denied: Only organization owners and admins can update settings",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    return this.orgRepository.update(organizationId, {
      name: dto.name?.trim(),
      description: dto.description?.trim(),
      status: dto.status,
    });
  }

  public async getMembers(organizationId: string, userId: string) {
    const member = await this.orgRepository.getMember(organizationId, userId);
    if (!member) {
      throw new AuthorizationError(
        "Access denied: You are not a member of this organization",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    return this.orgRepository.listMembers(organizationId);
  }

  public async inviteMember(organizationId: string, invitedByUserId: string, dto: InviteMemberInput) {
    const member = await this.orgRepository.getMember(organizationId, invitedByUserId);
    if (!member || (member.role !== OrganizationRole.OWNER && member.role !== OrganizationRole.ADMIN)) {
      throw new AuthorizationError(
        "Access denied: Only owners or admins can invite members",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    if (member.role === OrganizationRole.ADMIN && dto.role === OrganizationRole.OWNER) {
      throw new AuthorizationError(
        "Access denied: Admins cannot invite users with the Owner role",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.orgRepository.createInvitation({
      organizationId,
      email: dto.email.toLowerCase().trim(),
      role: dto.role,
      token,
      invitedById: invitedByUserId,
      expiresAt,
    });

    await domainEventBus.publish({
      eventName: DOMAIN_EVENTS.MEMBER_INVITED,
      entityType: "Invitation",
      entityId: invitation.id,
      actorId: invitedByUserId,
      timestamp: new Date(),
      payload: {
        organizationId,
        email: invitation.email,
        role: invitation.role,
      },
    });

    return invitation;
  }

  public async acceptInvitation(dto: AcceptInvitationInput, userId: string) {
    const invitation = await this.orgRepository.findInvitationByToken(dto.token);
    if (!invitation) {
      throw new NotFoundError("Invitation token is invalid or expired", ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ValidationError(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.orgRepository.updateInvitationStatus(invitation.id, InvitationStatus.EXPIRED);
      throw new ValidationError("Invitation token has expired");
    }

    const existingMember = await this.orgRepository.getMember(invitation.organizationId, userId);
    if (existingMember) {
      await this.orgRepository.updateInvitationStatus(invitation.id, InvitationStatus.ACCEPTED);
      throw new ConflictError("User is already a member of this organization", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    await this.orgRepository.transaction(async (tx) => {
      await this.orgRepository.addMember(invitation.organizationId, userId, invitation.role, tx);
      await this.orgRepository.updateInvitationStatus(invitation.id, InvitationStatus.ACCEPTED, tx);
    });

    await domainEventBus.publish({
      eventName: DOMAIN_EVENTS.MEMBER_JOINED,
      entityType: "OrganizationMember",
      entityId: `${invitation.organizationId}:${userId}`,
      actorId: userId,
      timestamp: new Date(),
      payload: {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role,
      },
    });

    return { message: "Successfully joined organization", organizationId: invitation.organizationId };
  }

  public async updateMemberRole(
    organizationId: string,
    actorUserId: string,
    targetUserId: string,
    dto: UpdateMemberRoleInput
  ) {
    const actorMember = await this.orgRepository.getMember(organizationId, actorUserId);
    if (!actorMember || (actorMember.role !== OrganizationRole.OWNER && actorMember.role !== OrganizationRole.ADMIN)) {
      throw new AuthorizationError("Access denied: Only owners or admins can update member roles", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }

    const targetMember = await this.orgRepository.getMember(organizationId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError("Target member not found in this organization", ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
    }

    if (actorMember.role === OrganizationRole.ADMIN) {
      if (dto.role === OrganizationRole.OWNER) {
        throw new AuthorizationError("Admins cannot assign the Owner role", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
      }
      if (targetMember.role === OrganizationRole.ADMIN || targetMember.role === OrganizationRole.OWNER) {
        throw new AuthorizationError("Admins cannot modify roles of other admins or owners", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
      }
    }

    if (targetMember.role === OrganizationRole.OWNER && dto.role !== OrganizationRole.OWNER) {
      throw new AuthorizationError("Cannot demote organization owner", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }

    return this.orgRepository.updateMemberRole(organizationId, targetUserId, dto.role);
  }

  public async removeMember(organizationId: string, actorUserId: string, targetUserId: string) {
    const actorMember = await this.orgRepository.getMember(organizationId, actorUserId);
    if (!actorMember || (actorMember.role !== OrganizationRole.OWNER && actorMember.role !== OrganizationRole.ADMIN)) {
      throw new AuthorizationError("Access denied: Only owners or admins can remove members", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }

    const targetMember = await this.orgRepository.getMember(organizationId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError("Target member not found in this organization", ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
    }

    if (actorMember.role === OrganizationRole.ADMIN && (targetMember.role === OrganizationRole.ADMIN || targetMember.role === OrganizationRole.OWNER)) {
      throw new AuthorizationError("Admins cannot remove other admins or owners", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }

    if (targetMember.role === OrganizationRole.OWNER) {
      throw new AuthorizationError("Cannot remove organization owner", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }

    await this.orgRepository.removeMember(organizationId, targetUserId);

    await domainEventBus.publish({
      eventName: DOMAIN_EVENTS.MEMBER_REMOVED,
      entityType: "OrganizationMember",
      entityId: `${organizationId}:${targetUserId}`,
      actorId: actorUserId,
      timestamp: new Date(),
      payload: {
        organizationId,
        userId: targetUserId,
      },
    });

    return { message: "Member removed successfully" };
  }
}

export const organizationService = new OrganizationService();
