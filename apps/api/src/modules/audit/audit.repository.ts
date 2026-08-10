import { Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { AuditLogQueryFilters } from "./audit.types.js";

/**
 * Repository layer for AuditLog database operations.
 */
export class AuditRepository extends BaseRepository {
  /**
   * Creates a new AuditLog entry in the database.
   */
  public async create(data: Prisma.AuditLogCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.auditLog.create({
        data,
      });
    });
  }

  /**
   * Retrieves a single AuditLog by ID with user relation.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.auditLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Retrieves paginated list of audit logs with filtering.
   */
  public async findAndCount(filters: AuditLogQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.AuditLogWhereInput = {};
      const conditions: Prisma.AuditLogWhereInput[] = [];

      if (filters.userId) {
        conditions.push({ userId: filters.userId });
      }

      if (filters.action && filters.action.trim().length > 0) {
        conditions.push({ action: { equals: filters.action.trim().toUpperCase() } });
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
            { action: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { ipAddress: { contains: query, mode: "insensitive" } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { user: { profile: { fullName: { contains: query, mode: "insensitive" } } } },
          ],
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      if (sortBy === "action") {
        orderBy.action = sortOrder;
      } else if (sortBy === "userId") {
        orderBy.userId = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [data, total] = await Promise.all([
        client.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        }),
        client.auditLog.count({ where }),
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
   * Retrieves summary statistics for audit logging dashboard.
   */
  public async getStatistics(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [totalLogs, recentLogs24h, recentLogs30d, actionGroups] = await Promise.all([
        client.auditLog.count(),
        client.auditLog.count({
          where: { createdAt: { gte: twentyFourHoursAgo } },
        }),
        client.auditLog.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
        client.auditLog.groupBy({
          by: ["action"],
          _count: { action: true },
          orderBy: {
            _count: { action: "desc" },
          },
          take: 10,
        }),
      ]);

      const topActions = actionGroups.map((ag) => ({
        action: ag.action,
        count: ag._count.action,
      }));

      return {
        totalLogs,
        recentLogs24h,
        recentLogs30d,
        topActions,
      };
    });
  }
}

export const auditRepository = new AuditRepository();
