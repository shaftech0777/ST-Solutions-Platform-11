import { Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { PermissionQueryFilters } from "./permissions.types.js";

/**
 * Data access repository for Permission entities.
 */
export class PermissionsRepository extends BaseRepository {
  private readonly permissionIncludes = {
    _count: {
      select: {
        roles: true,
      },
    },
  } as const;

  /**
   * Retrieves paginated list of permissions with search and filtering.
   */
  public async findAndCount(filters: PermissionQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.PermissionWhereInput = {};

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
        client.permission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: this.permissionIncludes,
        }),
        client.permission.count({ where }),
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
   * Retrieves permission entity by ID.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.permission.findUnique({
        where: { id },
        include: this.permissionIncludes,
      });
    });
  }

  /**
   * Retrieves permission entity by name.
   */
  public async findByName(name: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.permission.findUnique({
        where: { name },
        include: this.permissionIncludes,
      });
    });
  }

  /**
   * Creates a new permission record.
   */
  public async create(
    data: {
      name: string;
      description?: string | null;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.permission.create({
        data: {
          name: data.name,
          description: data.description ?? null,
        },
        include: this.permissionIncludes,
      });
    });
  }

  /**
   * Updates an existing permission entity.
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
      return client.permission.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
        },
        include: this.permissionIncludes,
      });
    });
  }

  /**
   * Deletes a permission record.
   */
  public async delete(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.permission.delete({
        where: { id },
      });
    });
  }
}

export const permissionsRepository = new PermissionsRepository();
