import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { permissionsService as defaultPermissionsService, PermissionsService } from "./permissions.service.js";
import {
  CreatePermissionInput,
  PermissionQueryInput,
  UpdatePermissionInput,
} from "./permissions.validation.js";

/**
 * Express HTTP Controller for Permissions management endpoints.
 */
export class PermissionsController {
  private readonly permissionsService: PermissionsService;

  constructor(permissionsService: PermissionsService = defaultPermissionsService) {
    this.permissionsService = permissionsService;
  }

  /**
   * Retrieves paginated permissions list.
   * GET /api/v1/permissions
   */
  public getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as PermissionQueryInput;
      const result = await this.permissionsService.getPermissions(query);

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
   * Retrieves single permission details by ID.
   * GET /api/v1/permissions/:permissionId
   */
  public getPermissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { permissionId } = req.params;
      const permission = await this.permissionsService.getPermissionById(permissionId);

      ResponseBuilder.success(res, permission, {
        message: "Permission details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new permission.
   * POST /api/v1/permissions
   */
  public createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreatePermissionInput;
      const newPermission = await this.permissionsService.createPermission(dto);

      ResponseBuilder.created(res, newPermission, {
        message: "Permission created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates an existing permission.
   * PATCH /api/v1/permissions/:permissionId
   */
  public updatePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { permissionId } = req.params;
      const dto = req.body as UpdatePermissionInput;

      const updatedPermission = await this.permissionsService.updatePermission(permissionId, dto);

      ResponseBuilder.success(res, updatedPermission, {
        message: "Permission updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes a permission entity.
   * DELETE /api/v1/permissions/:permissionId
   */
  public deletePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { permissionId } = req.params;
      const result = await this.permissionsService.deletePermission(permissionId);

      ResponseBuilder.success(res, result, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const permissionsController = new PermissionsController();
