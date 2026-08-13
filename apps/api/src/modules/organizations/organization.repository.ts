import { InvitationStatus, OrganizationRole, OrganizationStatus } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";

export class OrganizationRepository extends BaseRepository {
  public async create(
    data: {
      name: string;
      slug: string;
      description?: string;
      ownerId: string;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          status: OrganizationStatus.ACTIVE,
          ownerId: data.ownerId,
          members: {
            create: {
              userId: data.ownerId,
              role: OrganizationRole.OWNER,
            },
          },
          workspaces: {
            create: {
              name: "Default Workspace",
              slug: "default",
              description: "Primary workspace",
            },
          },
        },
      });
    });
  }

  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organization.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: { select: { fullName: true } },
                },
              },
            },
          },
          workspaces: true,
        },
      });
    });
  }

  public async findBySlug(slug: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organization.findUnique({
        where: { slug },
      });
    });
  }

  public async findUserOrganizations(userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organization.findMany({
        where: {
          members: {
            some: { userId },
          },
        },
        include: {
          members: {
            where: { userId },
            select: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  public async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: OrganizationStatus;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organization.update({
        where: { id },
        data,
      });
    });
  }

  public async getMember(organizationId: string, userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
      });
    });
  }

  public async listMembers(organizationId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organizationMember.findMany({
        where: { organizationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              accountType: true,
              status: true,
              profile: { select: { fullName: true, profileImage: true } },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });
    });
  }

  public async addMember(
    organizationId: string,
    userId: string,
    role: OrganizationRole = OrganizationRole.MEMBER,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organizationMember.create({
        data: {
          organizationId,
          userId,
          role,
        },
      });
    });
  }

  public async updateMemberRole(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organizationMember.update({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
        data: { role },
      });
    });
  }

  public async removeMember(organizationId: string, userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.organizationMember.delete({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
      });
    });
  }

  public async createInvitation(
    data: {
      organizationId: string;
      email: string;
      role: OrganizationRole;
      token: string;
      invitedById: string;
      expiresAt: Date;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.invitation.create({
        data: {
          organizationId: data.organizationId,
          email: data.email,
          role: data.role,
          token: data.token,
          invitedById: data.invitedById,
          expiresAt: data.expiresAt,
          status: InvitationStatus.PENDING,
        },
      });
    });
  }

  public async findInvitationByToken(token: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.invitation.findUnique({
        where: { token },
        include: { organization: true },
      });
    });
  }

  public async updateInvitationStatus(
    id: string,
    status: InvitationStatus,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.invitation.update({
        where: { id },
        data: { status },
      });
    });
  }
}

export const organizationRepository = new OrganizationRepository();
