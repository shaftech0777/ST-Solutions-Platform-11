import { Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { RoleQueryFilters } from "./roles.types.js";

/**
 * Data access repository for Role and RolePermission entities.
 */
export class RolesRepository extends BaseRepository {
  private readonly roleIncludes = {
    permissions: {
      include: {
        permission: true,
      },
    },
    _count: {
      select: {
        users: true,
      },
    },
  } as const;

  /**
   * Retrieves paginated roles list with optional search and ordering.
   */
  public async findAndCount(filters: RoleQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.RoleWhereInput = {};

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ];
      }

      const sortBy = filters.sortBy ?? "createdAt";
      const sortOrder = filters.sortOrder ?? "desc";

      const [items, totalRecords] = await Promise.all([
        client.role.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: this.roleIncludes,
        }),
        client.role.count({ where }),
      ]);

      return {
        items,
        totalRecords,
        page,
        limit,
      };
    });
  }

  /**
   * Retrieves role details by ID.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.findUnique({
        where: { id },
        include: this.roleIncludes,
      });
    });
  }

  /**
   * Retrieves role entity by name.
   */
  public async findByName(name: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.findUnique({
        where: { name },
        include: this.roleIncludes,
      });
    });
  }

  /**
   * Creates a new role and optionally assigns permissions.
   */
  public async create(
    data: {
      name: string;
      description?: string | null;
      permissionIds?: string[];
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          permissions: data.permissionIds && data.permissionIds.length > 0
            ? {
                create: data.permissionIds.map((permissionId) => ({
                  permission: { connect: { id: permissionId } },
                })),
              }
            : undefined,
        },
        include: this.roleIncludes,
      });
    });
  }

  /**
   * Updates existing role entity attributes.
   */
  public async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
        },
        include: this.roleIncludes,
      });
    });
  }

  /**
   * Deletes role entity.
   */
  public async delete(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.delete({
        where: { id },
      });
    });
  }

  /**
   * Retrieves all permissions assigned to a role.
   */
  public async getRolePermissions(roleId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.rolePermission.findMany({
        where: { roleId },
        include: {
          permission: true,
        },
      });
    });
  }

  /**
   * Assigns multiple permissions to a role. Ignores duplicates seamlessly.
   */
  public async assignPermissions(roleId: string, permissionIds: string[], tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      // Create entries ignoring potential duplicates
      await client.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      });

      return client.role.findUnique({
        where: { id: roleId },
        include: this.roleIncludes,
      });
    });
  }

  /**
   * Removes a single permission mapping from a role.
   */
  public async removePermission(roleId: string, permissionId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      await client.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId,
        },
      });

      return client.role.findUnique({
        where: { id: roleId },
        include: this.roleIncludes,
      });
    });
  }

  /**
   * Validates permissions existence by IDs.
   */
  public async findPermissionsByIds(permissionIds: string[], tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.permission.findMany({
        where: { id: { in: permissionIds } },
      });
    });
  }
}

export const rolesRepository = new RolesRepository();
