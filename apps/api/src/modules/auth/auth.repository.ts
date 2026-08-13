import { AccountType, OrganizationRole, OrganizationStatus, UserStatus } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";

import { prisma } from "../../database/prisma.client.js";

/**
 * Repository handling database operations for Authentication & User Session management.
 */
export class AuthRepository extends BaseRepository {
  /**
   * Standard include query selector for user relations required during authentication.
   */
  private readonly userAuthInclude = {
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
    organizationMemberships: {
      include: {
        organization: true,
      },
    },
  } as const;

  /**
   * Creates a user, profile, and optional default Organization in an atomic transaction.
   */
  public async createUserWithRegistration(
    data: {
      email: string;
      passwordHash: string;
      fullName: string;
      accountType?: AccountType;
      organizationName?: string;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const executeTransaction = async (transaction: TransactionClient) => {
        const user = await transaction.user.create({
          data: {
            email: data.email,
            passwordHash: data.passwordHash,
            accountType: data.accountType || AccountType.MEMBER,
            status: UserStatus.ACTIVE,
            profile: {
              create: {
                fullName: data.fullName,
              },
            },
          },
          include: this.userAuthInclude,
        });

        if (data.organizationName) {
          const slugBase = data.organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          const slug = `${slugBase}-${Date.now().toString(36)}`;

          await transaction.organization.create({
            data: {
              name: data.organizationName,
              slug,
              status: OrganizationStatus.ACTIVE,
              ownerId: user.id,
              members: {
                create: {
                  userId: user.id,
                  role: OrganizationRole.OWNER,
                },
              },
              workspaces: {
                create: {
                  name: "Default Workspace",
                  slug: "default",
                  description: "Default primary workspace",
                },
              },
            },
          });
        }

        return transaction.user.findUniqueOrThrow({
          where: { id: user.id },
          include: this.userAuthInclude,
        });
      };

      if (tx) {
        return executeTransaction(tx);
      }

      return prisma.$transaction(executeTransaction);
    });
  }

  /**
   * Finds a user entity by email address with authentication-related relations.
   */
  public async findByEmail(email: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.findUnique({
        where: { email },
        include: this.userAuthInclude,
      });
    });
  }

  /**
   * Finds a user entity by primary key ID with authentication-related relations.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.findUnique({
        where: { id },
        include: this.userAuthInclude,
      });
    });
  }

  /**
   * Creates a user session record.
   */
  public async createSession(
    data: {
      userId: string;
      tokenHash: string;
      ipAddress?: string;
      userAgent?: string;
      expiresAt: Date;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.session.create({
        data: {
          userId: data.userId,
          tokenHash: data.tokenHash,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          expiresAt: data.expiresAt,
        },
      });
    });
  }

  /**
   * Finds an active session by token hash.
   */
  public async findSessionByTokenHash(tokenHash: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.session.findFirst({
        where: { tokenHash },
        include: {
          user: {
            include: this.userAuthInclude,
          },
        },
      });
    });
  }

  /**
   * Deletes a specific session by ID.
   */
  public async deleteSession(sessionId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.session.delete({
        where: { id: sessionId },
      });
    });
  }

  /**
   * Involves deleting all active sessions for a given user.
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
   * Updates user passwordHash.
   */
  public async updatePasswordHash(userId: string, passwordHash: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    });
  }

  /**
   * Updates user status.
   */
  public async updateUserStatus(userId: string, status: UserStatus, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.update({
        where: { id: userId },
        data: { status },
      });
    });
  }
}

export const authRepository = new AuthRepository();
