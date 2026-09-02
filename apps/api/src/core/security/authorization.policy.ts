import { AccountType, UserStatus } from "@prisma/client";
import { AuthorizationError, BusinessError, ValidationError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import {
  canActorAssignRole,
  canActorManageTargetRole,
  normalizeRoleKey,
  ROLE_HIERARCHY_LEVEL,
} from "./permissions.js";
import { AuthUser } from "./security.types.js";

export interface ActorContext {
  userId: string;
  accountType: AccountType | string;
  role?: string;
  memberId?: string;
  organizationId?: string;
  workspaceId?: string;
}

export interface TargetUserContext {
  id: string;
  accountType: AccountType | string;
  status?: UserStatus | string;
  createdByUserId?: string | null;
  managedByUserId?: string | null;
  organizationId?: string | null;
  workspaceId?: string | null;
}

export interface TargetClientContext {
  id: string;
  createdById?: string | null;
  ownerId?: string | null;
  supervisorId?: string | null;
  organizationId?: string | null;
  workspaceId?: string | null;
  ownership?: {
    memberId?: string | null;
    assignedManagerId?: string | null;
    member?: {
      id?: string;
      userId?: string;
      managerId?: string | null;
    } | null;
  } | null;
}

export interface TargetProjectContext {
  id: string;
  clientId: string;
  createdById?: string | null;
  assignedManagerId?: string | null;
  assignedMemberId?: string | null;
  organizationId?: string | null;
  workspaceId?: string | null;
  client?: {
    id: string;
    userId?: string | null;
    ownerId?: string | null;
    createdById?: string | null;
  } | null;
}

export interface TargetPaymentContext {
  id: string;
  clientId: string;
  projectId?: string | null;
  client?: {
    id: string;
    userId?: string | null;
    ownerId?: string | null;
    createdById?: string | null;
  } | null;
}

/**
 * Authoritative Central Policy Engine for ST-Solutions Organizational Hierarchy,
 * Ownership Supervision, Tenant Isolation, and Resource Access Control.
 */
export class AuthorizationPolicy {
  /**
   * Evaluates if the actor is an Administrator with unrestricted governance.
   */
  public static isAdmin(actor?: ActorContext | AuthUser | null): boolean {
    if (!actor) return false;
    const norm = normalizeRoleKey(actor.accountType || actor.role);
    return norm === "ADMIN";
  }

  /**
   * Evaluates if the actor is a Sub-Administrator.
   */
  public static isSubAdmin(actor?: ActorContext | AuthUser | null): boolean {
    if (!actor) return false;
    const norm = normalizeRoleKey(actor.accountType || actor.role);
    return norm === "SUB_ADMIN";
  }

  /**
   * Evaluates if the actor is a Manager.
   */
  public static isManager(actor?: ActorContext | AuthUser | null): boolean {
    if (!actor) return false;
    const norm = normalizeRoleKey(actor.accountType || actor.role);
    return norm === "MANAGER";
  }

  /**
   * Evaluates if the actor is a standard Member.
   */
  public static isMember(actor?: ActorContext | AuthUser | null): boolean {
    if (!actor) return false;
    const norm = normalizeRoleKey(actor.accountType || actor.role);
    return norm === "MEMBER";
  }

  /**
   * Returns numeric hierarchy weight for a role.
   */
  public static getHierarchyWeight(accountType: string): number {
    return ROLE_HIERARCHY_LEVEL[normalizeRoleKey(accountType)] ?? 0;
  }

  /**
   * Checks if an actor can read or view a target user account.
   */
  public static canAccessUser(
    actor: ActorContext,
    target: TargetUserContext,
    options?: { assignedMemberIds?: string[] }
  ): boolean {
    if (!actor || !target) return false;

    // Self access is always permitted
    if (actor.userId === target.id) return true;

    // ADMIN has full visibility
    if (this.isAdmin(actor)) return true;

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(target.accountType);

    // SUB_ADMIN cannot view or manage ADMIN accounts
    if (actorKey === "SUB_ADMIN") {
      if (targetKey === "ADMIN") return false;
      return true;
    }

    // MANAGER can only view subordinate MEMBER accounts or accounts they manage/created
    if (actorKey === "MANAGER") {
      if (targetKey === "ADMIN" || targetKey === "SUB_ADMIN" || targetKey === "MANAGER") {
        return false;
      }
      if (targetKey === "MEMBER") {
        if (target.managedByUserId === actor.userId || target.createdByUserId === actor.userId) {
          return true;
        }
        if (options?.assignedMemberIds && options.assignedMemberIds.includes(target.id)) {
          return true;
        }
        return false;
      }
      return false;
    }

    // MEMBER and CLIENT cannot view other user records
    return false;
  }

  /**
   * Enforces that an actor can view a target user, throwing AuthorizationError if not.
   */
  public static enforceCanAccessUser(
    actor: ActorContext,
    target: TargetUserContext,
    options?: { assignedMemberIds?: string[] }
  ): void {
    if (!this.canAccessUser(actor, target, options)) {
      throw new AuthorizationError(
        `User with account type '${actor.accountType}' is not authorized to access user '${target.id}' (${target.accountType})`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor can modify or manage a target user account.
   */
  public static canManageUser(
    actor: ActorContext,
    target: TargetUserContext
  ): boolean {
    if (!actor || !target) return false;

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(target.accountType);

    // Self modifications of role/status are handled separately; for general edits:
    if (actor.userId === target.id) {
      return true;
    }

    if (this.isAdmin(actor)) return true;

    // SUB_ADMIN protection: cannot manage ADMIN
    if (actorKey === "SUB_ADMIN" && targetKey === "ADMIN") {
      return false;
    }

    // MANAGER can only manage assigned subordinates or members they created
    if (actorKey === "MANAGER" && targetKey === "MEMBER") {
      if (target.managedByUserId && target.managedByUserId !== actor.userId && target.createdByUserId !== actor.userId) {
        return false;
      }
    }

    // Check strict hierarchy weight
    return canActorManageTargetRole(actorKey, targetKey);
  }

  /**
   * Enforces that an actor can modify or manage a target user account.
   */
  public static enforceCanManageUser(
    actor: ActorContext,
    target: TargetUserContext
  ): void {
    if (!this.canManageUser(actor, target)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) is not authorized to manage '${target.accountType}' user accounts`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor can update status of a target user account.
   */
  public static canManageUserStatus(
    actor: ActorContext,
    target: TargetUserContext,
    newStatus: UserStatus | string
  ): boolean {
    if (!actor || !target) return false;

    // Self suspension or deactivation is forbidden
    if (actor.userId === target.id) {
      if (newStatus === UserStatus.SUSPENDED || newStatus === UserStatus.INACTIVE || newStatus === "DELETED") {
        return false;
      }
    }

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(target.accountType);

    // Sub-Admin cannot suspend/deactivate Admin
    if (actorKey === "SUB_ADMIN" && targetKey === "ADMIN") {
      return false;
    }

    if (this.isAdmin(actor)) return true;

    return canActorManageTargetRole(actorKey, targetKey);
  }

  /**
   * Enforces that an actor can update user status.
   */
  public static enforceCanManageUserStatus(
    actor: ActorContext,
    target: TargetUserContext,
    newStatus: UserStatus | string
  ): void {
    if (actor.userId === target.id) {
      throw new ValidationError("Users are strictly forbidden from modifying their own account status");
    }

    if (!this.canManageUserStatus(actor, target, newStatus)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot change the status of '${target.accountType}' users`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor can delete a target user account.
   */
  public static canDeleteUser(
    actor: ActorContext,
    target: TargetUserContext
  ): boolean {
    if (!actor || !target) return false;

    // Self deletion is forbidden
    if (actor.userId === target.id) return false;

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(target.accountType);

    // SUB_ADMIN can NEVER delete an ADMIN
    if (actorKey === "SUB_ADMIN" && targetKey === "ADMIN") {
      return false;
    }

    // MANAGER can NEVER delete ADMIN, SUB_ADMIN, or other MANAGERS
    if (actorKey === "MANAGER" && (targetKey === "ADMIN" || targetKey === "SUB_ADMIN" || targetKey === "MANAGER")) {
      return false;
    }

    // MANAGER can only delete assigned subordinate MEMBER
    if (actorKey === "MANAGER" && targetKey === "MEMBER") {
      if (target.managedByUserId && target.managedByUserId !== actor.userId && target.createdByUserId !== actor.userId) {
        return false;
      }
    }

    if (this.isAdmin(actor)) return true;

    return canActorManageTargetRole(actorKey, targetKey);
  }

  /**
   * Enforces user deletion permissions.
   */
  public static enforceCanDeleteUser(
    actor: ActorContext,
    target: TargetUserContext
  ): void {
    if (actor.userId === target.id) {
      throw new ValidationError("Users are strictly forbidden from deleting their own account");
    }

    if (!this.canDeleteUser(actor, target)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot delete user accounts with '${target.accountType}' level`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor can assign a new role/accountType to a user.
   */
  public static canAssignRole(
    actor: ActorContext,
    targetUser: TargetUserContext,
    newAccountType: AccountType | string
  ): boolean {
    if (!actor || !targetUser) return false;

    // Self promotion / escalation forbidden
    if (actor.userId === targetUser.id) return false;

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(targetUser.accountType);

    // If actor cannot manage target's current role, reject
    if (!this.isAdmin(actor) && !canActorManageTargetRole(actorKey, targetKey)) {
      return false;
    }

    // Check if actor can assign the new role
    return canActorAssignRole(actorKey, newAccountType);
  }

  /**
   * Enforces role assignment permissions.
   */
  public static enforceCanAssignRole(
    actor: ActorContext,
    targetUser: TargetUserContext,
    newAccountType: AccountType | string
  ): void {
    if (actor.userId === targetUser.id) {
      throw new ValidationError("Users are strictly forbidden from modifying their own role or account type");
    }

    if (!this.canAssignRole(actor, targetUser, newAccountType)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot change role or assign account type to '${newAccountType}'`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks client isolation and ownership access rules.
   * - ADMIN: unrestricted access.
   * - SUB_ADMIN: all clients in authorized scope.
   * - MANAGER: clients created by manager, supervised by manager, or owned by assigned members.
   * - MEMBER: clients created by or assigned to that member only.
   * - CLIENT: own client account only.
   */
  public static canAccessClient(
    actor: ActorContext,
    client: TargetClientContext,
    options?: { assignedMemberIds?: string[] }
  ): boolean {
    if (!actor || !client) return false;

    if (this.isAdmin(actor)) return true;
    if (this.isSubAdmin(actor)) return true;

    const actorKey = normalizeRoleKey(actor.accountType);

    // Client self-access
    if (actorKey === "CLIENT") {
      return client.id === actor.userId || client.ownerId === actor.userId;
    }

    // Member access: only own clients
    if (actorKey === "MEMBER") {
      const isCreator = client.createdById === actor.userId;
      const isOwner = client.ownerId === actor.userId;
      const isMemberMatch = actor.memberId && client.ownership?.memberId === actor.memberId;
      const isUserMatch = client.ownership?.member?.userId === actor.userId;

      return Boolean(isCreator || isOwner || isMemberMatch || isUserMatch);
    }

    // Manager access: clients of assigned team or supervised
    if (actorKey === "MANAGER") {
      const isCreator = client.createdById === actor.userId;
      const isSupervisor = client.supervisorId === actor.userId;
      const isAssignedManager = client.ownership?.assignedManagerId === actor.userId;
      const isMemberSupervised =
        client.ownership?.memberId &&
        options?.assignedMemberIds &&
        options.assignedMemberIds.includes(client.ownership.memberId);

      return Boolean(isCreator || isSupervisor || isAssignedManager || isMemberSupervised);
    }

    return false;
  }

  /**
   * Enforces client access permission.
   */
  public static enforceCanAccessClient(
    actor: ActorContext,
    client: TargetClientContext,
    options?: { assignedMemberIds?: string[] }
  ): void {
    if (!this.canAccessClient(actor, client, options)) {
      throw new AuthorizationError(
        `Access denied. Your role (${actor.accountType}) does not have permission to view or manage client '${client.id}'`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks project isolation and access rules.
   * - ADMIN / SUB_ADMIN: full access within scope.
   * - MANAGER: assigned manager, project creator, or client manager.
   * - MEMBER: assigned member, project creator, or client owner.
   * - CLIENT: strictly own projects only (where client.userId === actor.userId or clientId === actor.userId or client.ownerId === actor.userId).
   */
  public static canAccessProject(
    actor: ActorContext,
    project: TargetProjectContext
  ): boolean {
    if (!actor || !project) return false;

    if (this.isAdmin(actor)) return true;
    if (this.isSubAdmin(actor)) return true;

    const actorKey = normalizeRoleKey(actor.accountType);

    if (actorKey === "CLIENT") {
      const isDirectClient = project.clientId === actor.userId;
      const isClientUser = Boolean(project.client?.userId && project.client.userId === actor.userId);
      const isClientOwner = Boolean(project.client?.ownerId && project.client.ownerId === actor.userId);
      return isDirectClient || isClientUser || isClientOwner;
    }

    if (actorKey === "MEMBER") {
      const isAssigned = project.assignedMemberId === actor.userId;
      const isCreator = project.createdById === actor.userId;
      const isClientCreator = Boolean(project.client?.createdById && project.client.createdById === actor.userId);
      const isClientOwner = Boolean(project.client?.ownerId && project.client.ownerId === actor.userId);
      return isAssigned || isCreator || isClientCreator || isClientOwner;
    }

    if (actorKey === "MANAGER") {
      const isAssigned = project.assignedManagerId === actor.userId;
      const isCreator = project.createdById === actor.userId;
      const isAssignedMember = project.assignedMemberId === actor.userId;
      return isAssigned || isCreator || isAssignedMember;
    }

    return false;
  }

  /**
   * Enforces project access permission.
   */
  public static enforceCanAccessProject(
    actor: ActorContext,
    project: TargetProjectContext
  ): void {
    if (!this.canAccessProject(actor, project)) {
      throw new AuthorizationError(
        `Access denied. Your account type (${actor.accountType}) is not authorized to access project '${project.id}'`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks payment isolation and access rules.
   */
  public static canAccessPayment(
    actor: ActorContext,
    payment: TargetPaymentContext
  ): boolean {
    if (!actor || !payment) return false;

    if (this.isAdmin(actor)) return true;
    if (this.isSubAdmin(actor)) return true;

    const actorKey = normalizeRoleKey(actor.accountType);

    if (actorKey === "CLIENT") {
      const isDirectClient = payment.clientId === actor.userId;
      const isClientUser = Boolean(payment.client?.userId && payment.client.userId === actor.userId);
      const isClientOwner = Boolean(payment.client?.ownerId && payment.client.ownerId === actor.userId);
      return isDirectClient || isClientUser || isClientOwner;
    }

    if (actorKey === "MEMBER") {
      const isClientCreator = Boolean(payment.client?.createdById && payment.client.createdById === actor.userId);
      const isClientOwner = Boolean(payment.client?.ownerId && payment.client.ownerId === actor.userId);
      return isClientCreator || isClientOwner;
    }

    if (actorKey === "MANAGER") {
      return true;
    }

    return false;
  }

  /**
   * Enforces payment access permission.
   */
  public static enforceCanAccessPayment(
    actor: ActorContext,
    payment: TargetPaymentContext
  ): void {
    if (!this.canAccessPayment(actor, payment)) {
      throw new AuthorizationError(
        `Access denied. Your account type (${actor.accountType}) is not authorized to access payment record '${payment.id}'`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor has permission to manage Website CMS content.
   * ADMIN ONLY.
   */
  public static canManageCMS(actor: ActorContext): boolean {
    return this.isAdmin(actor);
  }

  /**
   * Enforces CMS management permission.
   */
  public static enforceCanManageCMS(actor: ActorContext): void {
    if (!this.canManageCMS(actor)) {
      throw new AuthorizationError(
        "Website CMS content management is restricted to Administrators only",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor has permission to manage Theme and Branding settings.
   * ADMIN ONLY.
   */
  public static canManageTheme(actor: ActorContext): boolean {
    return this.isAdmin(actor);
  }

  /**
   * Enforces Theme management permission.
   */
  public static enforceCanManageTheme(actor: ActorContext): void {
    if (!this.canManageTheme(actor)) {
      throw new AuthorizationError(
        "Platform Theme and Branding management is restricted to Administrators only",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor can issue an Administrative Notice to the target user.
   */
  public static canIssueNotice(
    actor: ActorContext,
    target: TargetUserContext,
    options?: { assignedMemberIds?: string[] }
  ): boolean {
    if (!actor || !target) return false;

    // Self notices make no sense
    if (actor.userId === target.id) return false;

    if (this.isAdmin(actor)) return true;

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(target.accountType);

    // SUB_ADMIN can issue to Manager, Member, Client (not Admin)
    if (actorKey === "SUB_ADMIN") {
      return targetKey !== "ADMIN";
    }

    // MANAGER can issue to assigned Members and Client
    if (actorKey === "MANAGER") {
      if (targetKey === "ADMIN" || targetKey === "SUB_ADMIN" || targetKey === "MANAGER") {
        return false;
      }
      if (targetKey === "MEMBER") {
        if (target.managedByUserId === actor.userId || target.createdByUserId === actor.userId) {
          return true;
        }
        if (options?.assignedMemberIds && options.assignedMemberIds.includes(target.id)) {
          return true;
        }
      }
      return false;
    }

    return false;
  }

  /**
   * Enforces notice issuing permission.
   */
  public static enforceCanIssueNotice(
    actor: ActorContext,
    target: TargetUserContext,
    options?: { assignedMemberIds?: string[] }
  ): void {
    if (!this.canIssueNotice(actor, target, options)) {
      throw new AuthorizationError(
        `Your role (${actor.accountType}) cannot issue administrative notices to '${target.accountType}' users`,
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }
  }

  /**
   * Checks if an actor can view a target user's performance record.
   */
  public static canViewPerformance(
    actor: ActorContext,
    targetUserId: string,
    targetAccountType: AccountType | string,
    options?: { assignedMemberIds?: string[] }
  ): boolean {
    if (actor.userId === targetUserId) return true;
    if (this.isAdmin(actor)) return true;

    const actorKey = normalizeRoleKey(actor.accountType);
    const targetKey = normalizeRoleKey(targetAccountType);

    if (actorKey === "SUB_ADMIN") {
      return targetKey !== "ADMIN";
    }

    if (actorKey === "MANAGER") {
      if (targetKey === "MEMBER") {
        return Boolean(options?.assignedMemberIds?.includes(targetUserId));
      }
    }

    return false;
  }
}
