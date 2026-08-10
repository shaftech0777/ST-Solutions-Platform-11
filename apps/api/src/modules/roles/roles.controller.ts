import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { rolesService as defaultRolesService, RolesService } from "./roles.service.js";
import {
  AssignPermissionsInput,
  CreateRoleInput,
  RoleQueryInput,
  UpdateRoleInput,
} from "./roles.validation.js";

/**
 * Express HTTP Controller for Roles management endpoints.
 */
export class RolesController {
  private readonly rolesService: RolesService;

  constructor(rolesService: RolesService = defaultRolesService) {
    this.rolesService = rolesService;
  }

  /**
   * Retrieves paginated roles list.
   * GET /api/v1/roles
   */
  public getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as RoleQueryInput;
      const result = await this.rolesService.getRoles(query);

      ResponseBuilder.paginated(res, result.items, {
        page: result.page,
        limit: result.limit,
        totalRecords: result.totalRecords,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves a single role entity by ID.
   * GET /api/v1/roles/:roleId
   */
  public getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const role = await this.rolesService.getRoleById(roleId);

      ResponseBuilder.success(res, role, {
        message: "Role details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new role.
   * POST /api/v1/roles
   */
  public createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
            permissions: authReq.user.permissions,
          }
        : undefined;

      const dto = req.body as CreateRoleInput;
      const newRole = await this.rolesService.createRole(dto, actor);

      ResponseBuilder.created(res, newRole, {
        message: "Role created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates an existing role attributes.
   * PATCH /api/v1/roles/:roleId
   */
  public updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
          }
        : undefined;

      const dto = req.body as UpdateRoleInput;
      const updatedRole = await this.rolesService.updateRole(roleId, dto, actor);

      ResponseBuilder.success(res, updatedRole, {
        message: "Role updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes a role entity.
   * DELETE /api/v1/roles/:roleId
   */
  public deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
          }
        : undefined;

      const result = await this.rolesService.deleteRole(roleId, actor);

      ResponseBuilder.success(res, result, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves permissions assigned to a specific role.
   * GET /api/v1/roles/:roleId/permissions
   */
  public getRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const permissions = await this.rolesService.getRolePermissions(roleId);

      ResponseBuilder.success(res, permissions, {
        message: "Role permissions retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assigns permission(s) to a role.
   * POST /api/v1/roles/:roleId/permissions
   */
  public assignPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
          }
        : undefined;

      const dto = req.body as AssignPermissionsInput;
      const permissionIds = dto.permissionIds ?? (dto.permissionId ? [dto.permissionId] : []);

      const updatedRole = await this.rolesService.assignPermissionsToRole(roleId, permissionIds, actor);

      ResponseBuilder.success(res, updatedRole, {
        message: "Permissions assigned to role successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Removes a permission from a role.
   * DELETE /api/v1/roles/:roleId/permissions/:permissionId
   */
  public removePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId, permissionId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? {
            userId: authReq.user.userId,
            accountType: authReq.user.accountType as AccountType,
          }
        : undefined;

      const updatedRole = await this.rolesService.removePermissionFromRole(roleId, permissionId, actor);

      ResponseBuilder.success(res, updatedRole, {
        message: "Permission removed from role successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const rolesController = new RolesController();
