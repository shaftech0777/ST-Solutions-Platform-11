import { AccountType, UserStatus } from "@prisma/client";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
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

    // If actor is SUB_ADMIN, hide ADMIN accounts unless actor is ADMIN
    const filteredItems = items.filter((user) => {
      if (actor?.accountType === AccountType.SUB_ADMIN && user.accountType === AccountType.ADMIN) {
        return false;
      }
      return true;
    });

    const sanitizedItems = filteredItems.map((user) => sanitizeUserResponse(user));

    return {
      items: sanitizedItems,
      totalRecords: actor?.accountType === AccountType.SUB_ADMIN ? sanitizedItems.length : totalRecords,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single user profile by ID.
   */
  public async getUserById(
    id: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    // Role visibility checks
    if (actor && actor.userId !== id) {
      if (actor.accountType === AccountType.SUB_ADMIN && user.accountType === AccountType.ADMIN) {
        throw new AuthorizationError(
          "Sub-administrators cannot view Administrator profiles",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        );
      }
      if (actor.accountType === AccountType.MANAGER && user.accountType !== AccountType.MEMBER) {
        throw new AuthorizationError(
          "Managers can only view Member profiles",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        );
      }
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
    if (actor && !canActorAssignRole(actor.accountType, targetAccountType)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot create users with account type '${targetAccountType}'`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const createdUser = await this.usersRepository.create({
      id: rawUserId || undefined,
      email: normalizedEmail,
      passwordHash,
      accountType: targetAccountType,
      status: dto.status ?? UserStatus.ACTIVE,
      roleId: dto.roleId ?? null,
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
      if (actor.accountType !== AccountType.ADMIN && !canActorManageTargetRole(actor.accountType, existingUser.accountType)) {
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
    dto: UpdateUserStatusInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    // Prevent self suspension / deactivation
    if (actor?.userId === id && (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.INACTIVE)) {
      throw new ValidationError(
        "Users are strictly forbidden from suspending or deactivating their own account"
      );
    }

    // Enforce hierarchy
    if (actor && actor.accountType !== AccountType.ADMIN && !canActorManageTargetRole(actor.accountType, existingUser.accountType)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot change status of users with '${existingUser.accountType}' level`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    // Last admin protection: cannot suspend or deactivate the last active admin
    if (
      existingUser.accountType === AccountType.ADMIN &&
      (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.INACTIVE)
    ) {
      const activeAdmins = await this.usersRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new ValidationError("Cannot suspend or deactivate the last active administrator account in the system");
      }
    }

    const updatedUser = await this.usersRepository.updateStatus(id, dto.status);

    if (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.INACTIVE) {
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

    // Prevent self role changes
    if (actor?.userId === id) {
      throw new ValidationError("Users are strictly forbidden from modifying their own role or account type");
    }

    // Role hierarchy check on target
    if (actor && actor.accountType !== AccountType.ADMIN && !canActorManageTargetRole(actor.accountType, existingUser.accountType)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot change role of users with '${existingUser.accountType}' level`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    // Role hierarchy check on new assigned role
    if (dto.accountType && actor && !canActorAssignRole(actor.accountType, dto.accountType)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot promote or assign users to '${dto.accountType}' level`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
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

    if (actor?.userId === id) {
      throw new ValidationError(
        "Users are strictly forbidden from deleting their own account"
      );
    }

    if (actor && actor.accountType !== AccountType.ADMIN && !canActorManageTargetRole(actor.accountType, existingUser.accountType)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot delete user accounts with '${existingUser.accountType}' level`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
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
      await this.usersRepository.updateStatus(id, UserStatus.INACTIVE);
      return { message: `User '${id}' deactivated successfully due to existing active references` };
    }
  }
}

export const usersService = new UsersService();
