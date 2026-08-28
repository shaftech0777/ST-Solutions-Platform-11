import { AccountType, UserStatus } from "@prisma/client";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { AuthorizationPolicy } from "../../core/security/authorization.policy.js";
import { canActorAssignRole, canActorManageTargetRole } from "../../core/security/permissions.js";
import { passwordService as defaultPasswordService, PasswordService } from "../../core/security/password.service.js";
import { sanitizeUserResponse } from "./users.mapper.js";
import { usersRepository as defaultUsersRepository, UsersRepository } from "./users.repository.js";
import { UserResponse } from "./users.types.js";
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserQueryInput,
} from "./users.validation.js";

/**
 * Service encapsulating User Management business operations and policy enforcement.
 */
export class UsersService {
  private readonly usersRepository: UsersRepository;
  private readonly passwordService: PasswordService;

  constructor(
    usersRepository: UsersRepository = defaultUsersRepository,
    passwordService: PasswordService = defaultPasswordService
  ) {
    this.usersRepository = usersRepository;
    this.passwordService = passwordService;
  }

  /**
   * Retrieves paginated list of users filtered by actor scope.
   */
  public async getUsers(
    filters: UserQueryInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<{
    items: readonly UserResponse[];
    totalRecords: number;
    page: number;
    limit: number;
  }> {
    const queryFilters = { ...filters };

    // Apply role-based filtering scope
    if (actor?.accountType === AccountType.MANAGER) {
      queryFilters.accountType = AccountType.MEMBER;
    }

    const { items, totalRecords, page, limit } = await this.usersRepository.findAndCount(queryFilters);

    // Apply centralized isolation filter
    const filteredItems = items.filter((user) => {
      if (!actor) return true;
      return AuthorizationPolicy.canAccessUser(
        { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
        user
      );
    });

    const sanitizedItems = filteredItems.map((user) => sanitizeUserResponse(user));

    return {
      items: sanitizedItems,
      totalRecords: sanitizedItems.length,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single user profile by ID with strict hierarchy check.
   */
  public async getUserById(
    id: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessUser(
        { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
        user
      );
    }

    return sanitizeUserResponse(user);
  }

  /**
   * Creates a new user with hashed password and associated profile.
   */
  public async createUser(
    dto: CreateUserInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const rawUserId = (dto.id || dto.userId || dto.username || "").trim();
    const explicitEmail = dto.email ? dto.email.toLowerCase().trim() : "";
    const normalizedEmail = explicitEmail || (rawUserId ? `${rawUserId.toLowerCase()}@st-solutions.internal` : `user-${Date.now().toString(36)}@st-solutions.internal`);
    const targetAccountType = dto.accountType ?? AccountType.MEMBER;

    if (rawUserId) {
      const existingById = await this.usersRepository.findById(rawUserId);
      if (existingById) {
        throw new ConflictError(`User ID '${rawUserId}' is already assigned to an existing account`, ERROR_CODES.USER_ALREADY_EXISTS);
      }
    }

    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("Email address is already registered to another account", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    if (dto.roleId) {
      const role = await this.usersRepository.findRoleById(dto.roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID '${dto.roleId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
      }
    }

    // Enforce role hierarchy: Actor must be allowed to assign the target role
    if (actor) {
      if (!canActorAssignRole(actor.accountType, targetAccountType)) {
        throw new AuthorizationError(
          `Your role (${actor.accountType}) cannot create users with account type '${targetAccountType}'`,
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        );
      }
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const createdUser = await this.usersRepository.create({
      id: rawUserId || undefined,
      email: normalizedEmail,
      passwordHash,
      accountType: targetAccountType,
      status: dto.status ?? UserStatus.ACTIVE,
      roleId: dto.roleId ?? null,
      createdByUserId: actor?.userId ?? null,
      managedByUserId: actor?.accountType === AccountType.MANAGER ? actor.userId : null,
      profile: dto.profile
        ? {
            fullName: dto.profile.fullName,
            profileImage: dto.profile.profileImage,
            phoneNumber: dto.profile.phoneNumber,
            country: dto.profile.country,
            city: dto.profile.city,
            address: dto.profile.address,
          }
        : undefined,
    });

    return sanitizeUserResponse(createdUser);
  }

  /**
   * Updates non-sensitive user profile and account properties.
   */
  public async updateUser(
    id: string,
    dto: UpdateUserInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    // Role hierarchy check when editing another user
    if (actor && actor.userId !== id) {
      if (!AuthorizationPolicy.canManageUser({ userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER }, existingUser)) {
        throw new AuthorizationError(
          `Your role (${actor.accountType}) is not authorized to edit user accounts with '${existingUser.accountType}' level`,
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        );
      }
    }

    let normalizedEmail: string | undefined;
    if (dto.email) {
      normalizedEmail = dto.email.toLowerCase().trim();
      const userWithEmail = await this.usersRepository.findByEmail(normalizedEmail);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictError("Email address is already in use by another user", ERROR_CODES.USER_ALREADY_EXISTS);
      }
    }

    const updatedUser = await this.usersRepository.update(id, {
      email: normalizedEmail,
      profile: dto.profile
        ? {
            fullName: dto.profile.fullName,
            profileImage: dto.profile.profileImage,
            phoneNumber: dto.profile.phoneNumber,
            country: dto.profile.country,
            city: dto.profile.city,
            address: dto.profile.address,
          }
        : undefined,
    });

    return sanitizeUserResponse(updatedUser);
  }

  /**
   * Updates user account status and revokes active sessions if deactivated/suspended.
   */
  public async updateUserStatus(
    id: string,
    dto: UpdateUserStatusInput & { suspensionReason?: string },
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanManageUserStatus(
        { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
        existingUser,
        dto.status
      );
    }

    // Last admin protection: cannot suspend or deactivate the last active admin
    if (
      existingUser.accountType === AccountType.ADMIN &&
      (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.INACTIVE || dto.status === UserStatus.DELETED)
    ) {
      const activeAdmins = await this.usersRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new ValidationError("Cannot suspend or deactivate the last active administrator account in the system");
      }
    }

    const updatedUser = await this.usersRepository.updateStatus(id, dto.status, {
      suspensionReason: dto.suspensionReason,
      suspendedAt: dto.status === UserStatus.SUSPENDED ? new Date() : null,
    });

    if (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.INACTIVE || dto.status === UserStatus.DELETED) {
      await this.usersRepository.deleteUserSessions(id);
    }

    return sanitizeUserResponse(updatedUser);
  }

  /**
   * Updates user assigned role and/or accountType.
   */
  public async updateUserRole(
    id: string,
    dto: UpdateUserRoleInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      if (dto.accountType) {
        AuthorizationPolicy.enforceCanAssignRole(
          { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
          existingUser,
          dto.accountType
        );
      } else {
        if (!AuthorizationPolicy.canManageUser({ userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER }, existingUser)) {
          throw new AuthorizationError(
            `Your role (${actor.accountType}) cannot change role of users with '${existingUser.accountType}' level`,
            ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
          );
        }
      }
    }

    if (dto.roleId) {
      const role = await this.usersRepository.findRoleById(dto.roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID '${dto.roleId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
      }
    }

    // Last admin protection: cannot demote last active admin
    if (
      existingUser.accountType === AccountType.ADMIN &&
      dto.accountType &&
      dto.accountType !== AccountType.ADMIN
    ) {
      const activeAdmins = await this.usersRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new ValidationError("Cannot change the account type of the last active administrator account");
      }
    }

    const updatedUser = await this.usersRepository.updateRole(id, {
      roleId: dto.roleId,
      accountType: dto.accountType,
    });

    return sanitizeUserResponse(updatedUser);
  }

  /**
   * Suspends a user with an explicit reason.
   */
  public async suspendUser(
    id: string,
    reason: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    return this.updateUserStatus(id, { status: UserStatus.SUSPENDED, suspensionReason: reason }, actor);
  }

  /**
   * Reactivates a suspended or inactive user.
   */
  public async reactivateUser(
    id: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    return this.updateUserStatus(id, { status: UserStatus.ACTIVE }, actor);
  }

  /**
   * Deletes user record or deactivates user safely.
   */
  public async deleteUser(
    id: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<{ message: string }> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanDeleteUser(
        { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
        existingUser
      );
    }

    // Last admin protection
    if (existingUser.accountType === AccountType.ADMIN) {
      const activeAdmins = await this.usersRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new ValidationError("Cannot delete the last active administrator account in the system");
      }
    }

    // Revoke sessions first
    await this.usersRepository.deleteUserSessions(id);

    try {
      await this.usersRepository.delete(id);
      return { message: `User '${id}' deleted successfully` };
    } catch {
      // Deactivation fallback if foreign keys prevent hard delete
      await this.usersRepository.updateStatus(id, UserStatus.DELETED);
      return { message: `User '${id}' soft-deleted successfully due to existing active references` };
    }
  }

  /**
   * Retrieves performance records for a user with authorization check.
   */
  public async getUserPerformance(
    userId: string,
    actor?: { userId?: string; accountType?: AccountType }
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID '${userId}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessUser(
        { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
        user
      );
    }

    const performance = await this.usersRepository.getUserPerformance(userId);
    return performance || {
      userId,
      clientAcquisitionCount: 0,
      revenueGenerated: 0,
      activeProjectsCount: 0,
      completedTasksCount: 0,
      rating: 5.0,
      rank: null,
    };
  }

  /**
   * Updates user performance metrics (Supervisor/Admin only).
   */
  public async updateUserPerformance(
    userId: string,
    data: any,
    actor?: { userId?: string; accountType?: AccountType }
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID '${userId}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanManageUser(
        { userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER },
        user
      );
    }

    return this.usersRepository.upsertUserPerformance(userId, data);
  }

  /**
   * Retrieves all ranks.
   */
  public async getRanks() {
    return this.usersRepository.getRanks();
  }

  /**
   * Retrieves leaderboard.
   */
  public async getLeaderboard(limit = 10) {
    return this.usersRepository.getLeaderboard(limit);
  }
}

export const usersService = new UsersService();
