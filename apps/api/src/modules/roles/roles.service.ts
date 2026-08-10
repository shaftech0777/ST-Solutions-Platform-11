import { AccountType } from "@prisma/client";
import { AuthorizationError, BusinessError, ConflictError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { SecurityLogger } from "../../core/security/security.logger.js";
import { sanitizeRoleResponse } from "./roles.mapper.js";
import { rolesRepository as defaultRolesRepository, RolesRepository } from "./roles.repository.js";
import { PermissionSummary, RoleResponse } from "./roles.types.js";
import { CreateRoleInput, RoleQueryInput, UpdateRoleInput } from "./roles.validation.js";

/**
 * System-critical protected role names that cannot be deleted or renamed.
 */
export const SYSTEM_PROTECTED_ROLES = ["ADMIN", "MANAGER", "MEMBER", "CLIENT"] as const;

/**
 * Service encapsulating Roles & Role-Permissions management and business rules.
 */
export class RolesService {
  private readonly rolesRepository: RolesRepository;

  constructor(rolesRepository: RolesRepository = defaultRolesRepository) {
    this.rolesRepository = rolesRepository;
  }

  /**
   * Retrieves paginated roles list with user counts and permissions.
   */
  public async getRoles(filters: RoleQueryInput): Promise<{
    items: readonly RoleResponse[];
    totalRecords: number;
    page: number;
    limit: number;
  }> {
    const { items, totalRecords, page, limit } = await this.rolesRepository.findAndCount(filters);

    const sanitizedItems = items.map((role) => sanitizeRoleResponse(role));

    return {
      items: sanitizedItems,
      totalRecords,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single role entity by ID.
   */
  public async getRoleById(id: string): Promise<RoleResponse> {
    const role = await this.rolesRepository.findById(id);

    if (!role) {
      throw new NotFoundError(`Role with ID '${id}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    return sanitizeRoleResponse(role);
  }

  /**
   * Creates a new role record.
   */
  public async createRole(
    dto: CreateRoleInput,
    actor?: { userId?: string; accountType?: AccountType; permissions?: readonly string[] }
  ): Promise<RoleResponse> {
    const normalizedName = dto.name.trim().toUpperCase();

    const existingRole = await this.rolesRepository.findByName(normalizedName);
    if (existingRole) {
      throw new ConflictError(`Role with name '${normalizedName}' already exists`, ERROR_CODES.ROLE_ALREADY_EXISTS);
    }

    // Privilege Escalation Protection: Only ADMIN can create ADMIN role or assign admin-level roles
    if (normalizedName === "ADMIN" && actor?.accountType !== AccountType.ADMIN) {
      SecurityLogger.logAccessDenied({
        userId: actor?.userId ?? "UNKNOWN",
        requiredRoleOrPermission: "AccountType: ADMIN",
        endpoint: "RolesService.createRole",
      });
      throw new AuthorizationError(
        "Only administrators can create the ADMIN role",
        ERROR_CODES.FORBIDDEN_INSUFFICIENT_PRIVILEGES
      );
    }

    // Validate provided permission IDs if any
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      const uniquePermissionIds = Array.from(new Set(dto.permissionIds));
      const foundPermissions = await this.rolesRepository.findPermissionsByIds(uniquePermissionIds);

      if (foundPermissions.length !== uniquePermissionIds.length) {
        throw new NotFoundError(
          "One or more provided permission IDs were not found",
          ERROR_CODES.PERMISSION_NOT_FOUND
        );
      }
    }

    const createdRole = await this.rolesRepository.create({
      name: normalizedName,
      description: dto.description,
      permissionIds: dto.permissionIds,
    });

    return sanitizeRoleResponse(createdRole);
  }

  /**
   * Updates an existing role entity properties.
   */
  public async updateRole(
    id: string,
    dto: UpdateRoleInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<RoleResponse> {
    const existingRole = await this.rolesRepository.findById(id);

    if (!existingRole) {
      throw new NotFoundError(`Role with ID '${id}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    let normalizedName: string | undefined;
    if (dto.name !== undefined) {
      normalizedName = dto.name.trim().toUpperCase();

      // System protected role renaming check
      const isSystemRole = (SYSTEM_PROTECTED_ROLES as readonly string[]).includes(existingRole.name.toUpperCase());
      if (isSystemRole && normalizedName !== existingRole.name.toUpperCase()) {
        throw new BusinessError(
          `Protected system role '${existingRole.name}' cannot be renamed`,
          ERROR_CODES.ROLE_PROTECTED_SYSTEM_ROLE
        );
      }

      if (normalizedName !== existingRole.name.toUpperCase()) {
        const roleWithName = await this.rolesRepository.findByName(normalizedName);
        if (roleWithName && roleWithName.id !== id) {
          throw new ConflictError(
            `Role with name '${normalizedName}' already exists`,
            ERROR_CODES.ROLE_ALREADY_EXISTS
          );
        }
      }
    }

    // Privilege escalation check
    if (existingRole.name.toUpperCase() === "ADMIN" && actor?.accountType !== AccountType.ADMIN) {
      throw new AuthorizationError(
        "Only administrators are permitted to modify the ADMIN role",
        ERROR_CODES.FORBIDDEN_INSUFFICIENT_PRIVILEGES
      );
    }

    const updatedRole = await this.rolesRepository.update(id, {
      name: normalizedName,
      description: dto.description,
    });

    return sanitizeRoleResponse(updatedRole);
  }

  /**
   * Deletes a role entity.
   */
  public async deleteRole(
    id: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<{ message: string }> {
    const existingRole = await this.rolesRepository.findById(id);

    if (!existingRole) {
      throw new NotFoundError(`Role with ID '${id}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    // Protect system roles from deletion
    const isSystemRole = (SYSTEM_PROTECTED_ROLES as readonly string[]).includes(existingRole.name.toUpperCase());
    if (isSystemRole) {
      throw new BusinessError(
        `System-protected role '${existingRole.name}' cannot be deleted`,
        ERROR_CODES.ROLE_PROTECTED_SYSTEM_ROLE
      );
    }

    // Check if users are assigned to this role
    if (existingRole._count?.users && existingRole._count.users > 0) {
      throw new ConflictError(
        `Cannot delete role '${existingRole.name}' as it is currently assigned to ${existingRole._count.users} user(s)`,
        ERROR_CODES.CONFLICT_RECORD_EXISTS
      );
    }

    if (actor?.accountType !== AccountType.ADMIN) {
      // Allow role deletion by permitted actors with roles.delete
    }

    await this.rolesRepository.delete(id);

    return { message: `Role '${existingRole.name}' deleted successfully` };
  }

  /**
   * Retrieves permissions assigned to a role.
   */
  public async getRolePermissions(roleId: string): Promise<readonly PermissionSummary[]> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID '${roleId}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    const rolePermissions = await this.rolesRepository.getRolePermissions(roleId);

    return rolePermissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      createdAt: rp.permission.createdAt,
    }));
  }

  /**
   * Assigns permission(s) to a role.
   */
  public async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<RoleResponse> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID '${roleId}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    // Privilege escalation check
    if (role.name.toUpperCase() === "ADMIN" && actor?.accountType !== AccountType.ADMIN) {
      throw new AuthorizationError(
        "Only administrators can modify permissions for the ADMIN role",
        ERROR_CODES.FORBIDDEN_INSUFFICIENT_PRIVILEGES
      );
    }

    const uniquePermissionIds = Array.from(new Set(permissionIds));
    const foundPermissions = await this.rolesRepository.findPermissionsByIds(uniquePermissionIds);

    if (foundPermissions.length !== uniquePermissionIds.length) {
      throw new NotFoundError(
        "One or more specified permission IDs do not exist",
        ERROR_CODES.PERMISSION_NOT_FOUND
      );
    }

    const updatedRole = await this.rolesRepository.assignPermissions(roleId, uniquePermissionIds);

    if (!updatedRole) {
      throw new NotFoundError(`Role with ID '${roleId}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    return sanitizeRoleResponse(updatedRole);
  }

  /**
   * Removes a permission from a role.
   */
  public async removePermissionFromRole(
    roleId: string,
    permissionId: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<RoleResponse> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID '${roleId}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    // Privilege escalation check
    if (role.name.toUpperCase() === "ADMIN" && actor?.accountType !== AccountType.ADMIN) {
      throw new AuthorizationError(
        "Only administrators can modify permissions for the ADMIN role",
        ERROR_CODES.FORBIDDEN_INSUFFICIENT_PRIVILEGES
      );
    }

    const updatedRole = await this.rolesRepository.removePermission(roleId, permissionId);

    if (!updatedRole) {
      throw new NotFoundError(`Role with ID '${roleId}' was not found`, ERROR_CODES.ROLE_NOT_FOUND);
    }

    return sanitizeRoleResponse(updatedRole);
  }
}

export const rolesService = new RolesService();
