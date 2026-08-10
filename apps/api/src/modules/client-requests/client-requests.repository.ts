import { Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { prisma } from "../../database/prisma.client.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { ClientRequestQueryFilters, ClientRequestStatus } from "./client-requests.types.js";

/**
 * Repository layer for ClientRequest domain database operations.
 */
export class ClientRequestsRepository extends BaseRepository {
  /**
   * Retrieves paginated list of client requests with filtering and search support.
   */
  public async findAndCount(filters: ClientRequestQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.ClientRequestWhereInput = {};
      const conditions: Prisma.ClientRequestWhereInput[] = [];

      if (filters.status && filters.status.trim().length > 0) {
        conditions.push({ status: { equals: filters.status.trim().toUpperCase() } });
      }

      if (filters.country && filters.country.trim().length > 0) {
        conditions.push({ country: { contains: filters.country.trim(), mode: "insensitive" } });
      }

      if (filters.startDate || filters.endDate) {
        const dateCondition: Prisma.DateTimeFilter = {};
        if (filters.startDate) {
          dateCondition.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          dateCondition.lte = new Date(filters.endDate);
        }
        conditions.push({ createdAt: dateCondition });
      }

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        conditions.push({
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query, mode: "insensitive" } },
            { message: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
          ],
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.ClientRequestOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      if (sortBy === "fullName") {
        orderBy.fullName = sortOrder;
      } else if (sortBy === "email") {
        orderBy.email = sortOrder;
      } else if (sortBy === "status") {
        orderBy.status = sortOrder;
      } else if (sortBy === "updatedAt") {
        orderBy.updatedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [data, total] = await Promise.all([
        client.clientRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        client.clientRequest.count({ where }),
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
   * Finds a client request by ID.
   */
  public async findById(requestId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.clientRequest.findUnique({
        where: { id: requestId },
      });
    });
  }

  /**
   * Finds a client request by email.
   */
  public async findByEmail(email: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.clientRequest.findFirst({
        where: { email: email.trim().toLowerCase() },
      });
    });
  }

  /**
   * Finds an existing Client record by email.
   */
  public async findClientByEmail(email: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.findFirst({
        where: { email: email.trim().toLowerCase() },
      });
    });
  }

  /**
   * Creates a new client request.
   */
  public async create(data: Prisma.ClientRequestCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.clientRequest.create({
        data,
      });
    });
  }

  /**
   * Updates an existing client request.
   */
  public async update(requestId: string, data: Prisma.ClientRequestUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.clientRequest.update({
        where: { id: requestId },
        data,
      });
    });
  }

  /**
   * Deletes a client request by ID.
   */
  public async delete(requestId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.clientRequest.delete({
        where: { id: requestId },
      });
    });
  }

  /**
   * Creates a new Client record during conversion.
   */
  public async createClient(data: Prisma.ClientCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.create({
        data,
      });
    });
  }

  /**
   * Calculates aggregate statistics for client requests.
   */
  public async getStatistics(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const [
        totalRequests,
        statusGroups,
        countryGroups,
        recentCount,
      ] = await Promise.all([
        client.clientRequest.count(),
        client.clientRequest.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        client.clientRequest.groupBy({
          by: ["country"],
          _count: { country: true },
        }),
        client.clientRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
            },
          },
        }),
      ]);

      let pendingRequests = 0;
      let inReviewRequests = 0;
      let contactedRequests = 0;
      let convertedRequests = 0;
      let rejectedRequests = 0;
      let archivedRequests = 0;

      const statusBreakdown = statusGroups.map((sg) => {
        const count = sg._count.status;
        const st = sg.status.toUpperCase();

        if (st === ClientRequestStatus.PENDING) pendingRequests = count;
        else if (st === ClientRequestStatus.IN_REVIEW) inReviewRequests = count;
        else if (st === ClientRequestStatus.CONTACTED) contactedRequests = count;
        else if (st === ClientRequestStatus.CONVERTED) convertedRequests = count;
        else if (st === ClientRequestStatus.REJECTED) rejectedRequests = count;
        else if (st === ClientRequestStatus.ARCHIVED) archivedRequests = count;

        return {
          status: sg.status,
          count,
        };
      });

      const countryBreakdown = countryGroups.map((cg) => ({
        country: cg.country || "UNSPECIFIED",
        count: cg._count.country,
      }));

      return {
        totalRequests,
        pendingRequests,
        inReviewRequests,
        contactedRequests,
        convertedRequests,
        rejectedRequests,
        archivedRequests,
        recentRequestsTotal: recentCount,
        statusBreakdown,
        countryBreakdown,
      };
    });
  }

  /**
   * Executes database transaction.
   */
  public async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.execute(async () => {
      return prisma.$transaction(fn);
    });
  }
}

export const clientRequestsRepository = new ClientRequestsRepository();
