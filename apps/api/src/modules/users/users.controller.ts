import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { usersService as defaultUsersService, UsersService } from "./users.service.js";
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UserQueryInput,
} from "./users.validation.js";

/**
 * Controller handling Express HTTP endpoints for User Management.
 */
export class UsersController {
  private readonly usersService: UsersService;

  constructor(usersService: UsersService = defaultUsersService) {
    this.usersService = usersService;
  }

  /**
   * Retrieves paginated list of users.
   * GET /api/v1/users
   */
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const query = req.query as unknown as UserQueryInput;
      const result = await this.usersService.getUsers(query, actor);

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
   * Retrieves single user details by ID.
   * GET /api/v1/users/:id
   */
  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const user = await this.usersService.getUserById(id, actor);

      ResponseBuilder.success(res, user, {
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new user record.
   * POST /api/v1/users
   */
  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const dto = req.body as CreateUserInput;
      const newUser = await this.usersService.createUser(dto, actor);

      ResponseBuilder.created(res, newUser, {
        message: "User account created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates non-sensitive user profile attributes.
   * PATCH /api/v1/users/:id
   */
  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const dto = req.body as UpdateUserInput;

      const updatedUser = await this.usersService.updateUser(id, dto, actor);

      ResponseBuilder.success(res, updatedUser, {
        message: "User profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates user status (e.g. ACTIVE, SUSPENDED, INACTIVE).
   * PATCH /api/v1/users/:id/status
   */
  public updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const dto = req.body as UpdateUserStatusInput;

      const updatedUser = await this.usersService.updateUserStatus(id, dto, actor);

      ResponseBuilder.success(res, updatedUser, {
        message: "User status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates user role assignment or account type.
   * PATCH /api/v1/users/:id/role
   */
  public updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const dto = req.body as UpdateUserRoleInput;

      const updatedUser = await this.usersService.updateUserRole(id, dto, actor);

      ResponseBuilder.success(res, updatedUser, {
        message: "User role assignment updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes or deactivates a user record.
   * DELETE /api/v1/users/:id
   */
  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const result = await this.usersService.deleteUser(id, actor);

      ResponseBuilder.success(res, result, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
