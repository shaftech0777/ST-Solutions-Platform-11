import { MemberStatus, Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { prisma } from "../../database/prisma.client.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { MemberQueryFilters } from "./members.types.js";

/**
 * Repository layer for Member domain data operations.
 */
export class MembersRepository extends BaseRepository {
  private readonly memberIncludes = {
    rank: true,
    user: {
      include: {
        profile: true,
        memberProfiles: {
          include: {
            application: true,
          },
        },
      },
    },
    manager: {
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    },
  } as const;

  /**
   * Retrieves paginated list of members based on filter options.
   */
  public async findAndCount(filters: MemberQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.MemberWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.rankId) {
        where.rankId = filters.rankId;
      }

      if (filters.managerId) {
        where.managerId = filters.managerId;
      }

      const conditions: Prisma.MemberWhereInput[] = [];

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        conditions.push({
          OR: [
            { user: { email: { contains: query, mode: "insensitive" } } },
            { user: { profile: { fullName: { contains: query, mode: "insensitive" } } } },
            { user: { profile: { phoneNumber: { contains: query, mode: "insensitive" } } } },
            { user: { profile: { city: { contains: query, mode: "insensitive" } } } },
            { user: { profile: { country: { contains: query, mode: "insensitive" } } } },
          ],
        });
      }

      if (filters.country && filters.country.trim().length > 0) {
        conditions.push({
          user: {
            profile: {
              country: { contains: filters.country.trim(), mode: "insensitive" },
            },
          },
        });
      }

      if (filters.city && filters.city.trim().length > 0) {
        conditions.push({
          user: {
            profile: {
              city: { contains: filters.city.trim(), mode: "insensitive" },
            },
          },
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.MemberOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      if (sortBy === "status") {
        orderBy.status = sortOrder;
      } else if (sortBy === "trustScore") {
        orderBy.trustScore = sortOrder;
      } else if (sortBy === "joinedAt") {
        orderBy.joinedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [data, total] = await Promise.all([
        client.member.findMany({
          where,
          include: this.memberIncludes,
          skip,
          take: limit,
          orderBy,
        }),
        client.member.count({ where }),
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
   * Finds a member by primary member ID.
   */
  public async findById(memberId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.member.findUnique({
        where: { id: memberId },
        include: this.memberIncludes,
      });
    });
  }

  /**
   * Finds a member record associated with a user ID.
   */
  public async findByUserId(userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.member.findUnique({
        where: { userId },
        include: this.memberIncludes,
      });
    });
  }

  /**
   * Finds a rank record by rank ID.
   */
  public async findRankById(rankId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.rank.findUnique({
        where: { id: rankId },
      });
    });
  }

  /**
   * Updates member record.
   */
  public async update(memberId: string, data: Prisma.MemberUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.member.update({
        where: { id: memberId },
        data,
        include: this.memberIncludes,
      });
    });
  }

  /**
   * Updates user profile associated with member.
   */
  public async updateProfile(userId: string, data: Prisma.UserProfileUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...(data as Prisma.UserProfileCreateWithoutUserInput),
        },
        update: data,
      });
    });
  }

  /**
   * Creates a rank history record when rank changes.
   */
  public async createRankHistory(data: Prisma.MemberRankHistoryUncheckedCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.memberRankHistory.create({
        data,
      });
    });
  }

  /**
   * Checks if member exists by ID.
   */
  public async exists(memberId: string, tx?: TransactionClient): Promise<boolean> {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const count = await client.member.count({
        where: { id: memberId },
      });
      return count > 0;
    });
  }

  /**
   * Calculates high-level aggregate statistics for members.
   */
  public async getStatistics(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const [total, active, inactive, suspended, removed, rankCounts, recentCount] = await Promise.all([
        client.member.count(),
        client.member.count({ where: { status: MemberStatus.ACTIVE } }),
        client.member.count({ where: { status: MemberStatus.INACTIVE } }),
        client.member.count({ where: { status: MemberStatus.SUSPENDED } }),
        client.member.count({ where: { status: MemberStatus.REMOVED } }),
        client.member.groupBy({
          by: ["rankId"],
          _count: {
            rankId: true,
          },
        }),
        client.member.count({
          where: {
            joinedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // joined in last 30 days
            },
          },
        }),
      ]);

      const ranks = await client.rank.findMany({
        select: { id: true, name: true },
      });

      const rankMap = new Map(ranks.map((r) => [r.id, r.name]));

      const membersByRank = rankCounts.map((rc) => ({
        rankId: rc.rankId,
        rankName: rankMap.get(rc.rankId) || "Unknown Rank",
        count: rc._count.rankId,
      }));

      return {
        totalMembers: total,
        activeMembers: active,
        inactiveMembers: inactive,
        suspendedMembers: suspended,
        removedMembers: removed,
        membersByRank,
        recentlyJoinedCount: recentCount,
      };
    });
  }

  /**
   * Runs callback inside a Prisma transaction context.
   */
  public async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.execute(async () => {
      return prisma.$transaction(fn);
    });
  }
}

export const membersRepository = new MembersRepository();
