import crypto from "crypto";
import { AccountType, UserStatus } from "@prisma/client";
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { AuthorizationPolicy } from "../../core/security/authorization.policy.js";
import { canActorAssignRole, canActorManageTargetRole } from "../../core/security/permissions.js";
import { passwordService as defaultPasswordService, PasswordService } from "../../core/security/password.service.js";
import { sanitizeUserResponse } from "./users.mapper.js";
import { usersRepository as defaultUsersRepository, UsersRepository } from "./users.repository.js";
import { TeamTreeNode, UserResponse } from "./users.types.js";
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
   * Automatically clears expired user suspensions (after 1 month duration).
   */
  public async processExpiredSuspensions(): Promise<number> {
    try {
      const expiredUsers = await this.usersRepository.findExpiredSuspensions();
      for (const u of expiredUsers) {
        await this.usersRepository.updateStatus(u.id, UserStatus.ACTIVE, {
          suspensionReason: null,
          suspendedAt: null,
          suspensionExpiresAt: null,
        });
      }
      return expiredUsers.length;
    } catch {
      return 0;
    }
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
    // Lazy expire any past due suspensions
    await this.processExpiredSuspensions();

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

    let validCreatedByUserId: string | null = null;
    let validManagedByUserId: string | null = null;

    if (actor?.userId) {
      try {
        const actorUser = await this.usersRepository.findById(actor.userId);
        if (actorUser) {
          validCreatedByUserId = actorUser.id;
          if (actor.accountType === AccountType.MANAGER) {
            validManagedByUserId = actorUser.id;
          }
        }
      } catch {
        // Non-fatal if actor user check fails
      }
    }

    if (dto.managedByUserId && (actor?.accountType === AccountType.ADMIN || actor?.accountType === AccountType.SUB_ADMIN)) {
      const targetManager = await this.usersRepository.findById(dto.managedByUserId);
      if (targetManager) {
        validManagedByUserId = targetManager.id;
      }
    }

    const createdUser = await this.usersRepository.create({
      id: rawUserId || undefined,
      email: normalizedEmail,
      passwordHash,
      accountType: targetAccountType,
      status: dto.status ?? UserStatus.ACTIVE,
      roleId: dto.roleId ?? null,
      createdByUserId: validCreatedByUserId,
      managedByUserId: validManagedByUserId,
      organizationId: dto.organizationId ?? null,
      workspaceId: dto.workspaceId ?? null,
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

    let targetManagedByUserId = dto.managedByUserId;
    if (targetManagedByUserId) {
      const managerExists = await this.usersRepository.findById(targetManagedByUserId);
      if (!managerExists) {
        throw new NotFoundError(`Manager with ID '${targetManagedByUserId}' was not found`, ERROR_CODES.DATABASE_RECORD_NOT_FOUND);
      }
    }

    const updatedUser = await this.usersRepository.update(id, {
      email: normalizedEmail,
      managedByUserId: targetManagedByUserId,
      organizationId: dto.organizationId,
      workspaceId: dto.workspaceId,
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
    if (actor && actor.accountType === AccountType.MEMBER) {
      throw new AuthorizationError(
        "Members cannot change roles or permissions of any user",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

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
   * Securely resets a user's password and revokes all active sessions.
   * Generates a strong temporary password if not explicitly provided and returns it once to the administrator.
   */
  public async resetUserPassword(
    id: string,
    newPassword?: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<{ message: string; temporaryPassword: string; userId: string; email: string | null }> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    if (actor) {
      if (!AuthorizationPolicy.canManageUser({ userId: actor.userId || "", accountType: actor.accountType || AccountType.MEMBER }, existingUser)) {
        throw new AuthorizationError(
          `Your role (${actor.accountType}) is not authorized to reset password for accounts at '${existingUser.accountType}' level`,
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        );
      }
    }

    // Generate cryptographically strong random password if none passed
    const generatedPassword =
      newPassword && newPassword.trim().length >= 8
        ? newPassword.trim()
        : `ST#${crypto.randomBytes(4).toString("hex").toUpperCase()}-${Math.random().toString(36).substring(2, 7)}!`;

    const passwordHash = await this.passwordService.hashPassword(generatedPassword);
    await this.usersRepository.updatePassword(id, passwordHash);
    await this.usersRepository.deleteUserSessions(id);

    return {
      message: "Password has been successfully updated and previous sessions invalidated. Securely share this temporary password with the user.",
      temporaryPassword: generatedPassword,
      userId: existingUser.id,
      email: existingUser.email,
    };
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

  /**
   * Generates dynamic organizational tree structure strictly from real database relationships:
   * ADMIN -> SUB_ADMIN -> MANAGER -> MEMBER -> CLIENT
   */
  public async getTeamTree(
    actor?: { userId?: string; accountType?: AccountType },
    organizationId?: string
  ): Promise<TeamTreeNode[]> {
    const { users, clients } = await this.usersRepository.getTeamTreeRawData(organizationId);

    // 1. Construct CLIENT nodes
    const clientNodes: TeamTreeNode[] = clients.map((c: any) => {
      const projects = c.projects || [];
      return {
        id: c.id,
        type: "CLIENT" as const,
        name: c.fullName || c.companyName || "Unnamed Client",
        email: c.email || null,
        loginId: c.userId || c.id,
        avatar: c.profileImage || c.user?.profile?.profileImage || null,
        status: c.clientStatus || "LEAD",
        phoneNumber: c.phoneNumber || null,
        roleName: "CLIENT",
        directReportsCount: 0,
        clientsCount: 0,
        projectsCount: projects.length,
        children: [],
        metadata: {
          companyName: c.companyName || null,
          memberId: c.ownerId || c.ownership?.member?.userId || null,
          memberName: c.ownership?.member?.user?.profile?.fullName || null,
          managerId: c.supervisorId || c.ownership?.manager?.id || null,
          managerName: c.ownership?.manager?.profile?.fullName || null,
          createdAt: c.createdAt,
          projects: projects.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.projectStatus,
            progress: p.progressPercentage,
            budget: p.budget,
            currency: p.currency,
          })),
        },
      };
    });

    // Index clients by owner/member User ID
    const clientsByMemberId = new Map<string, TeamTreeNode[]>();
    const clientsBySupervisorId = new Map<string, TeamTreeNode[]>();
    const unassignedClients: TeamTreeNode[] = [];

    clientNodes.forEach((node) => {
      const memberId = node.metadata?.memberId;
      const supervisorId = node.metadata?.managerId;
      if (memberId) {
        if (!clientsByMemberId.has(memberId)) clientsByMemberId.set(memberId, []);
        clientsByMemberId.get(memberId)!.push(node);
      } else if (supervisorId) {
        if (!clientsBySupervisorId.has(supervisorId)) clientsBySupervisorId.set(supervisorId, []);
        clientsBySupervisorId.get(supervisorId)!.push(node);
      } else {
        unassignedClients.push(node);
      }
    });

    // 2. Separate Users by Role
    const memberUsers = users.filter((u: any) => u.accountType === AccountType.MEMBER);
    const managerUsers = users.filter((u: any) => u.accountType === AccountType.MANAGER);
    const subAdminUsers = users.filter((u: any) => u.accountType === AccountType.SUB_ADMIN);
    const adminUsers = users.filter((u: any) => u.accountType === AccountType.ADMIN);

    // 3. Construct MEMBER nodes
    const memberNodes: TeamTreeNode[] = memberUsers.map((u: any) => {
      const assignedClients = clientsByMemberId.get(u.id) || [];
      const assignedProjects = u.assignedProjects || [];
      const managerId = u.managedByUserId || u.memberAccount?.manager?.user?.id || null;
      const managerName =
        u.managedByUser?.profile?.fullName ||
        u.memberAccount?.manager?.user?.profile?.fullName ||
        null;

      return {
        id: u.id,
        type: AccountType.MEMBER,
        name: u.profile?.fullName || u.email || "Unnamed Member",
        email: u.email || null,
        loginId: u.id,
        avatar: u.profile?.profileImage || null,
        status: u.status,
        phoneNumber: u.profile?.phoneNumber || null,
        roleName: u.role?.name || "MEMBER",
        directReportsCount: 0,
        clientsCount: assignedClients.length,
        projectsCount: assignedProjects.length,
        children: assignedClients,
        metadata: {
          managerId,
          managerName,
          createdAt: u.createdAt,
          projects: assignedProjects.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.projectStatus,
            progress: p.progressPercentage,
            budget: p.budget,
            currency: p.currency,
          })),
        },
      };
    });

    // Index members by Manager ID
    const membersByManagerId = new Map<string, TeamTreeNode[]>();
    const unassignedMembers: TeamTreeNode[] = [];

    memberNodes.forEach((node) => {
      const mgrId = node.metadata?.managerId;
      if (mgrId) {
        if (!membersByManagerId.has(mgrId)) membersByManagerId.set(mgrId, []);
        membersByManagerId.get(mgrId)!.push(node);
      } else {
        unassignedMembers.push(node);
      }
    });

    // 4. Construct MANAGER nodes
    const managerNodes: TeamTreeNode[] = managerUsers.map((u: any) => {
      const directMembers = membersByManagerId.get(u.id) || [];
      const directClients = clientsBySupervisorId.get(u.id) || [];
      const managedProjects = u.managedProjects || [];

      // Calculate total clients across direct members plus supervisor clients
      const totalClientsCount =
        directClients.length +
        directMembers.reduce((sum, m) => sum + m.clientsCount, 0);

      const supervisorId = u.managedByUserId || null;
      const supervisorName = u.managedByUser?.profile?.fullName || null;

      return {
        id: u.id,
        type: AccountType.MANAGER,
        name: u.profile?.fullName || u.email || "Unnamed Manager",
        email: u.email || null,
        loginId: u.id,
        avatar: u.profile?.profileImage || null,
        status: u.status,
        phoneNumber: u.profile?.phoneNumber || null,
        roleName: u.role?.name || "MANAGER",
        directReportsCount: directMembers.length,
        clientsCount: totalClientsCount,
        projectsCount: managedProjects.length,
        children: [...directMembers, ...directClients],
        metadata: {
          supervisorId,
          supervisorName,
          createdAt: u.createdAt,
          projects: managedProjects.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.projectStatus,
            progress: p.progressPercentage,
            budget: p.budget,
            currency: p.currency,
          })),
        },
      };
    });

    // Index managers by Supervisor (Sub-Admin or Admin)
    const managersBySupervisorId = new Map<string, TeamTreeNode[]>();
    const directAdminManagers: TeamTreeNode[] = [];

    managerNodes.forEach((node) => {
      const supId = node.metadata?.supervisorId;
      if (supId) {
        if (!managersBySupervisorId.has(supId)) managersBySupervisorId.set(supId, []);
        managersBySupervisorId.get(supId)!.push(node);
      } else {
        directAdminManagers.push(node);
      }
    });

    // 5. Construct SUB_ADMIN nodes
    const subAdminNodes: TeamTreeNode[] = subAdminUsers.map((u: any) => {
      const directManagers = managersBySupervisorId.get(u.id) || [];
      const totalReports =
        directManagers.length +
        directManagers.reduce((sum, m) => sum + m.directReportsCount, 0);
      const totalClients = directManagers.reduce((sum, m) => sum + m.clientsCount, 0);

      return {
        id: u.id,
        type: AccountType.SUB_ADMIN,
        name: u.profile?.fullName || u.email || "Unnamed Sub-Admin",
        email: u.email || null,
        loginId: u.id,
        avatar: u.profile?.profileImage || null,
        status: u.status,
        phoneNumber: u.profile?.phoneNumber || null,
        roleName: u.role?.name || "SUB_ADMIN",
        directReportsCount: totalReports,
        clientsCount: totalClients,
        projectsCount: 0,
        children: directManagers,
        metadata: {
          supervisorId: u.managedByUserId || null,
          supervisorName: u.managedByUser?.profile?.fullName || null,
          createdAt: u.createdAt,
        },
      };
    });

    // Index subadmins by admin
    const subAdminsByAdminId = new Map<string, TeamTreeNode[]>();
    const unassignedSubAdmins: TeamTreeNode[] = [];

    subAdminNodes.forEach((node) => {
      const adminId = node.metadata?.supervisorId;
      if (adminId) {
        if (!subAdminsByAdminId.has(adminId)) subAdminsByAdminId.set(adminId, []);
        subAdminsByAdminId.get(adminId)!.push(node);
      } else {
        unassignedSubAdmins.push(node);
      }
    });

    // 6. Construct ADMIN nodes
    let adminNodes: TeamTreeNode[] = adminUsers.map((u: any) => {
      const mySubAdmins = subAdminsByAdminId.get(u.id) || [];
      const myManagers = managersBySupervisorId.get(u.id) || [];

      return {
        id: u.id,
        type: AccountType.ADMIN,
        name: u.profile?.fullName || u.email || "Executive Admin",
        email: u.email || null,
        loginId: u.id,
        avatar: u.profile?.profileImage || null,
        status: u.status,
        phoneNumber: u.profile?.phoneNumber || null,
        roleName: u.role?.name || "ADMIN",
        directReportsCount: mySubAdmins.length + myManagers.length,
        clientsCount: 0,
        projectsCount: 0,
        children: [...mySubAdmins, ...myManagers],
        metadata: {
          createdAt: u.createdAt,
        },
      };
    });

    // Distribute unassigned subadmins, direct managers, or orphaned members under admin nodes
    if (adminNodes.length > 0) {
      const primaryAdmin = adminNodes[0];
      const remainingSubAdmins = unassignedSubAdmins.filter(
        (sa) => !primaryAdmin.children.some((c) => c.id === sa.id)
      );
      const remainingManagers = directAdminManagers.filter(
        (m) => !adminNodes.some((a) => a.children.some((c) => c.id === m.id))
      );

      primaryAdmin.children.push(...remainingSubAdmins, ...remainingManagers);
      if (unassignedMembers.length > 0) {
        primaryAdmin.children.push(...unassignedMembers);
      }
      if (unassignedClients.length > 0) {
        primaryAdmin.children.push(...unassignedClients);
      }

      // Recompute administrative rolls
      adminNodes.forEach((admin) => {
        admin.directReportsCount = admin.children.length;
      });
    } else {
      // If no admin exists in organization, return highest available tier as top-level roots
      adminNodes = [
        ...subAdminNodes,
        ...directAdminManagers,
        ...unassignedMembers,
        ...unassignedClients,
      ];
    }

    // Role-based visibility scoping
    if (actor && actor.accountType) {
      if (actor.accountType === AccountType.SUB_ADMIN) {
        const found = subAdminNodes.find((sa) => sa.id === actor.userId);
        return found ? [found] : [];
      }
      if (actor.accountType === AccountType.MANAGER) {
        const found = managerNodes.find((m) => m.id === actor.userId);
        return found ? [found] : [];
      }
      if (actor.accountType === AccountType.MEMBER) {
        const found = memberNodes.find((m) => m.id === actor.userId);
        return found ? [found] : [];
      }
      if (actor.accountType === AccountType.CLIENT) {
        const found = clientNodes.find((c) => c.id === actor.userId || c.loginId === actor.userId);
        return found ? [found] : [];
      }
    }

    return adminNodes;
  }
}

export const usersService = new UsersService();
