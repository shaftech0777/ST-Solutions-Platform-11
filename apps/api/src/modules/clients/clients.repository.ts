import { ClientStatus, Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { prisma } from "../../database/prisma.client.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { ClientQueryFilters } from "./clients.types.js";

/**
 * Repository layer for Client domain data operations.
 */
export class ClientsRepository extends BaseRepository {
  private readonly clientIncludes = {
    user: {
      include: {
        profile: true,
      },
    },
    ownership: {
      include: {
        member: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        manager: {
          include: {
            profile: true,
          },
        },
      },
    },
    _count: {
      select: {
        projects: true,
        payments: true,
      },
    },
  } as const;

  private readonly clientDetailIncludes = {
    ...this.clientIncludes,
    projects: {
      take: 5,
      orderBy: { createdAt: "desc" as const },
    },
  } as const;

  /**
   * Retrieves paginated list of clients with search and filter options.
   */
  public async findAndCount(filters: ClientQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.ClientWhereInput = {};

      if (filters.status) {
        where.clientStatus = filters.status;
      }

      const conditions: Prisma.ClientWhereInput[] = [];

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        conditions.push({
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
          ],
        });
      }

      if (filters.country && filters.country.trim().length > 0) {
        conditions.push({
          country: { contains: filters.country.trim(), mode: "insensitive" },
        });
      }

      if (filters.city && filters.city.trim().length > 0) {
        conditions.push({
          city: { contains: filters.city.trim(), mode: "insensitive" },
        });
      }

      if (filters.businessType && filters.businessType.trim().length > 0) {
        conditions.push({
          businessType: { contains: filters.businessType.trim(), mode: "insensitive" },
        });
      }

      if (filters.memberId) {
        conditions.push({
          ownership: {
            memberId: filters.memberId,
          },
        });
      }

      if (filters.assignedManagerId) {
        conditions.push({
          ownership: {
            assignedManagerId: filters.assignedManagerId,
          },
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.ClientOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      if (sortBy === "fullName") {
        orderBy.fullName = sortOrder;
      } else if (sortBy === "companyName") {
        orderBy.companyName = sortOrder;
      } else if (sortBy === "clientStatus") {
        orderBy.clientStatus = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [data, total] = await Promise.all([
        client.client.findMany({
          where,
          include: this.clientIncludes,
          skip,
          take: limit,
          orderBy,
        }),
        client.client.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    });
  }

  /**
   * Finds a client record by primary client ID.
   */
  public async findById(clientId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.findUnique({
        where: { id: clientId },
        include: this.clientDetailIncludes,
      });
    });
  }

  /**
   * Finds a client record by email address.
   */
  public async findByEmail(email: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        include: this.clientIncludes,
      });
    });
  }

  /**
   * Checks if email address is already used by another client.
   */
  public async existsByEmail(email: string, excludeId?: string, tx?: TransactionClient): Promise<boolean> {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const count = await client.client.count({
        where: {
          email: { equals: email, mode: "insensitive" },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });
      return count > 0;
    });
  }

  /**
   * Creates a new client record.
   */
  public async create(data: Prisma.ClientCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.create({
        data,
        include: this.clientDetailIncludes,
      });
    });
  }

  /**
   * Updates an existing client record.
   */
  public async update(clientId: string, data: Prisma.ClientUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.update({
        where: { id: clientId },
        data,
        include: this.clientDetailIncludes,
      });
    });
  }

  /**
   * Assigns or updates client ownership link to a member and optional manager.
   */
  public async upsertOwnership(
    clientId: string,
    memberId: string,
    assignedManagerId?: string,
    notes?: string,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      return client.clientOwnership.upsert({
        where: { clientId },
        create: {
          clientId,
          memberId,
          assignedManagerId: assignedManagerId || null,
          notes: notes || null,
        },
        update: {
          memberId,
          assignedManagerId: assignedManagerId || null,
          notes: notes || null,
          assignedAt: new Date(),
        },
      });
    });
  }

  /**
   * Checks if a member exists by memberId.
   */
  public async findMemberById(memberId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.member.findUnique({
        where: { id: memberId },
      });
    });
  }

  /**
   * Checks if a user manager exists by userId.
   */
  public async findManagerUserById(userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.findUnique({
        where: { id: userId },
      });
    });
  }

  /**
   * Calculates aggregate statistics for clients.
   */
  public async getStatistics(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const [total, statusCounts, ownedCount, unassignedCount, recentCount] = await Promise.all([
        client.client.count(),
        client.client.groupBy({
          by: ["clientStatus"],
          _count: {
            clientStatus: true,
          },
        }),
        client.client.count({
          where: { ownership: { isNot: null } },
        }),
        client.client.count({
          where: { ownership: { is: null } },
        }),
        client.client.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
            },
          },
        }),
      ]);

      const clientsByStatus = statusCounts.map((sc) => ({
        status: sc.clientStatus,
        count: sc._count.clientStatus,
      }));

      return {
        totalClients: total,
        clientsByStatus,
        recentlyAddedCount: recentCount,
        ownedClientsCount: ownedCount,
        unassignedClientsCount: unassignedCount,
      };
    });
  }

  /**
   * Executes a database transaction.
   */
  public async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.execute(async () => {
      return prisma.$transaction(fn);
    });
  }
}

export const clientsRepository = new ClientsRepository();
