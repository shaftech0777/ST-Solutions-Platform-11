import { AccountType, UserStatus } from "@prisma/client";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
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
   * Retrieves paginated list of users.
   */
  public async getUsers(filters: UserQueryInput): Promise<{
    items: readonly UserResponse[];
    totalRecords: number;
    page: number;
    limit: number;
  }> {
    const { items, totalRecords, page, limit } = await this.usersRepository.findAndCount(filters);

    const sanitizedItems = items.map((user) => sanitizeUserResponse(user));

    return {
      items: sanitizedItems,
      totalRecords,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single user profile by ID.
   */
  public async getUserById(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
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
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("Email address is already registered", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    if (dto.roleId) {
      const role = await this.usersRepository.findRoleById(dto.roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID '${dto.roleId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
      }
    }

    // Prevent privilege escalation: only ADMIN can assign ADMIN account type
    if (dto.accountType === AccountType.ADMIN && actor?.accountType !== AccountType.ADMIN) {
      throw new AuthorizationError(
        "Only administrators can create users with ADMIN account type",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const createdUser = await this.usersRepository.create({
      email: normalizedEmail,
      passwordHash,
      accountType: dto.accountType ?? AccountType.MEMBER,
      status: dto.status ?? UserStatus.PENDING,
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
  public async updateUser(id: string, dto: UpdateUserInput): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
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
    actorUserId?: string
  ): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    // Prevent self suspension / deactivation
    if (actorUserId === id && (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.INACTIVE)) {
      throw new ValidationError(
        "Users are strictly forbidden from suspending or deactivating their own account"
      );
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

    if (dto.roleId) {
      const role = await this.usersRepository.findRoleById(dto.roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID '${dto.roleId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
      }
    }

    // Prevent privilege escalation
    if (dto.accountType === AccountType.ADMIN && actor?.accountType !== AccountType.ADMIN) {
      throw new AuthorizationError(
        "Only administrators can promote users to ADMIN account type",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
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
  public async deleteUser(id: string, actorUserId?: string): Promise<{ message: string }> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actorUserId === id) {
      throw new ValidationError(
        "Users are strictly forbidden from deleting their own account"
      );
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
