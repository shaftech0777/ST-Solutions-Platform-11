import { WorkspaceRole } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";

export class WorkspaceRepository extends BaseRepository {
  public async create(
    data: {
      organizationId: string;
      name: string;
      slug: string;
      description?: string;
      creatorId: string;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.workspace.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          members: {
            create: {
              userId: data.creatorId,
              role: WorkspaceRole.ADMIN,
            },
          },
        },
      });
    });
  }

  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.workspace.findUnique({
        where: { id },
        include: {
          organization: true,
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
        },
      });
    });
  }

  public async findByOrganization(organizationId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.workspace.findMany({
        where: { organizationId, isArchived: false },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  public async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      isArchived?: boolean;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.workspace.update({
        where: { id },
        data,
      });
    });
  }

  public async delete(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.workspace.delete({
        where: { id },
      });
    });
  }

  public async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole = WorkspaceRole.MEMBER,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.workspaceMember.create({
        data: {
          workspaceId,
          userId,
          role,
        },
      });
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
