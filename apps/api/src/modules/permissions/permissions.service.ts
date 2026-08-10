import { ConflictError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { sanitizePermissionResponse } from "./permissions.mapper.js";
import {
  permissionsRepository as defaultPermissionsRepository,
  PermissionsRepository,
} from "./permissions.repository.js";
import { PermissionResponse } from "./permissions.types.js";
import { CreatePermissionInput, PermissionQueryInput, UpdatePermissionInput } from "./permissions.validation.js";

/**
 * Service encapsulating Permission business operations and policy enforcement.
 */
export class PermissionsService {
  private readonly permissionsRepository: PermissionsRepository;

  constructor(permissionsRepository: PermissionsRepository = defaultPermissionsRepository) {
    this.permissionsRepository = permissionsRepository;
  }

  /**
   * Retrieves paginated list of system permissions.
   */
  public async getPermissions(filters: PermissionQueryInput): Promise<{
    items: readonly PermissionResponse[];
    totalRecords: number;
    page: number;
    limit: number;
  }> {
    const { items, totalRecords, page, limit } = await this.permissionsRepository.findAndCount(filters);

    const sanitizedItems = items.map((perm) => sanitizePermissionResponse(perm));

    return {
      items: sanitizedItems,
      totalRecords,
      page,
      limit,
    };
  }

  /**
   * Retrieves single permission details by ID.
   */
  public async getPermissionById(id: string): Promise<PermissionResponse> {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new NotFoundError(`Permission with ID '${id}' was not found`, ERROR_CODES.PERMISSION_NOT_FOUND);
    }

    return sanitizePermissionResponse(permission);
  }

  /**
   * Creates a new system permission entity.
   */
  public async createPermission(dto: CreatePermissionInput): Promise<PermissionResponse> {
    const normalizedName = dto.name.trim().toLowerCase();

    const existingPermission = await this.permissionsRepository.findByName(normalizedName);
    if (existingPermission) {
      throw new ConflictError(
        `Permission with name '${normalizedName}' already exists`,
        ERROR_CODES.PERMISSION_ALREADY_EXISTS
      );
    }

    const createdPermission = await this.permissionsRepository.create({
      name: normalizedName,
      description: dto.description,
    });

    return sanitizePermissionResponse(createdPermission);
  }

  /**
   * Updates an existing permission entity.
   */
  public async updatePermission(id: string, dto: UpdatePermissionInput): Promise<PermissionResponse> {
    const existingPermission = await this.permissionsRepository.findById(id);

    if (!existingPermission) {
      throw new NotFoundError(`Permission with ID '${id}' was not found`, ERROR_CODES.PERMISSION_NOT_FOUND);
    }

    let normalizedName: string | undefined;
    if (dto.name !== undefined) {
      normalizedName = dto.name.trim().toLowerCase();
      if (normalizedName !== existingPermission.name) {
        const permissionWithName = await this.permissionsRepository.findByName(normalizedName);
        if (permissionWithName && permissionWithName.id !== id) {
          throw new ConflictError(
            `Permission with name '${normalizedName}' already exists`,
            ERROR_CODES.PERMISSION_ALREADY_EXISTS
          );
        }
      }
    }

    const updatedPermission = await this.permissionsRepository.update(id, {
      name: normalizedName,
      description: dto.description,
    });

    return sanitizePermissionResponse(updatedPermission);
  }

  /**
   * Deletes a permission record safely.
   */
  public async deletePermission(id: string): Promise<{ message: string }> {
    const existingPermission = await this.permissionsRepository.findById(id);

    if (!existingPermission) {
      throw new NotFoundError(`Permission with ID '${id}' was not found`, ERROR_CODES.PERMISSION_NOT_FOUND);
    }

    // Check if permission is currently assigned to any roles
    if (existingPermission._count?.roles && existingPermission._count.roles > 0) {
      throw new ConflictError(
        `Cannot delete permission '${existingPermission.name}' as it is currently assigned to ${existingPermission._count.roles} role(s)`,
        ERROR_CODES.CONFLICT_RECORD_EXISTS
      );
    }

    await this.permissionsRepository.delete(id);

    return { message: `Permission '${existingPermission.name}' deleted successfully` };
  }
}

export const permissionsService = new PermissionsService();
