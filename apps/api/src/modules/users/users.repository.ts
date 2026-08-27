import { AccountType, Prisma, UserStatus } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { UserQueryFilters } from "./users.types.js";

/**
 * Data access repository for User entities and related UserProfile records.
 */
export class UsersRepository extends BaseRepository {
  /**
   * Universal relation include graph for complete user context retrieval.
   */
  private readonly userIncludes = {
    role: {
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    },
    profile: true,
  } as const;

  /**
   * Retrieves paginated users list with optional search and filtering.
   */
  public async findAndCount(filters: UserQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.UserWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.accountType) {
        where.accountType = filters.accountType;
      }

      if (filters.roleId) {
        where.roleId = filters.roleId;
      }

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        where.OR = [
          { email: { contains: query, mode: "insensitive" } },
          { profile: { fullName: { contains: query, mode: "insensitive" } } },
        ];
      }

      const sortBy = filters.sortBy ?? "createdAt";
      const sortOrder = filters.sortOrder ?? "desc";

      const [items, totalRecords] = await Promise.all([
        client.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: this.userIncludes,
        }),
        client.user.count({ where }),
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
   * Retrieves a single user record by ID.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const trimmed = id.trim();
      const normalized = trimmed.toLowerCase();
      const user = await client.user.findFirst({
        where: {
          OR: [
            { id: trimmed },
            { id: { equals: normalized, mode: "insensitive" } },
            { id: { equals: trimmed, mode: "insensitive" } },
          ],
        },
        include: this.userIncludes,
      });

      if (user) return user;

      try {
        return await client.user.findUnique({
          where: { id: trimmed },
          include: this.userIncludes,
        });
      } catch {
        return null;
      }
    });
  }

  /**
   * Finds user by email address.
   */
  public async findByEmail(email: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const trimmed = email.trim();
      const normalized = trimmed.toLowerCase();
      const user = await client.user.findFirst({
        where: {
          OR: [
            { email: { equals: normalized, mode: "insensitive" } },
            { email: { equals: trimmed, mode: "insensitive" } },
            { email: normalized },
            { email: trimmed },
          ],
        },
        include: this.userIncludes,
      });

      if (user) return user;

      try {
        return await client.user.findUnique({
          where: { email: normalized },
          include: this.userIncludes,
        });
      } catch {
        return null;
      }
    });
  }

  /**
   * Verifies if a role exists by ID.
   */
  public async findRoleById(roleId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.findUnique({
        where: { id: roleId },
      });
    });
  }

  /**
   * Creates a new user record and optionally creates their profile.
   */
  public async create(
    data: {
      id?: string;
      email: string;
      passwordHash: string;
      accountType: AccountType;
      status: UserStatus;
      roleId?: string | null;
      profile?: {
        fullName?: string;
        profileImage?: string | null;
        phoneNumber?: string | null;
        country?: string | null;
        city?: string | null;
        address?: string | null;
      };
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.create({
        data: {
          id: data.id,
          email: data.email,
          passwordHash: data.passwordHash,
          accountType: data.accountType,
          status: data.status,
          roleId: data.roleId ?? null,
          profile: data.profile
            ? {
                create: {
                  fullName: data.profile.fullName ?? null,
                  profileImage: data.profile.profileImage ?? null,
                  phoneNumber: data.profile.phoneNumber ?? null,
                  country: data.profile.country ?? null,
                  city: data.profile.city ?? null,
                  address: data.profile.address ?? null,
                },
              }
            : undefined,
        },
        include: this.userIncludes,
      });
    });
  }

  /**
   * Updates user core entity fields and nested UserProfile.
   */
  public async update(
    id: string,
    data: {
      email?: string;
      profile?: {
        fullName?: string | null;
        profileImage?: string | null;
        phoneNumber?: string | null;
        country?: string | null;
        city?: string | null;
        address?: string | null;
      };
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const updateData: Prisma.UserUpdateInput = {};

      if (data.email !== undefined) {
        updateData.email = data.email;
      }

      if (data.profile !== undefined) {
        updateData.profile = {
          upsert: {
            create: {
              fullName: data.profile.fullName ?? null,
              profileImage: data.profile.profileImage ?? null,
              phoneNumber: data.profile.phoneNumber ?? null,
              country: data.profile.country ?? null,
              city: data.profile.city ?? null,
              address: data.profile.address ?? null,
            },
            update: {
              fullName: data.profile.fullName,
              profileImage: data.profile.profileImage,
              phoneNumber: data.profile.phoneNumber,
              country: data.profile.country,
              city: data.profile.city,
              address: data.profile.address,
            },
          },
        };
      }

      return client.user.update({
        where: { id },
        data: updateData,
        include: this.userIncludes,
      });
    });
  }

  /**
   * Updates user status.
   */
  public async updateStatus(id: string, status: UserStatus, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.update({
        where: { id },
        data: { status },
        include: this.userIncludes,
      });
    });
  }

  /**
   * Updates user role and/or accountType.
   */
  public async updateRole(
    id: string,
    data: { roleId?: string | null; accountType?: AccountType },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.update({
        where: { id },
        data,
        include: this.userIncludes,
      });
    });
  }

  /**
   * Counts active administrators in the system.
   */
  public async countActiveAdmins(tx?: TransactionClient): Promise<number> {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.count({
        where: {
          accountType: AccountType.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });
    });
  }

  /**
   * Deletes user active sessions.
   */
  public async deleteUserSessions(userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.session.deleteMany({
        where: { userId },
      });
    });
  }

  /**
   * Deletes a user record.
   */
  public async delete(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.delete({
        where: { id },
      });
    });
  }
}

export const usersRepository = new UsersRepository();
