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
   * Securely resets a user's password (Supervisor/Admin only).
   * POST /api/v1/users/:id/reset-password
   */
  public resetUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const { newPassword } = req.body;

      const result = await this.usersService.resetUserPassword(id, newPassword, actor);

      ResponseBuilder.success(res, result, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Suspends a user with an administrative reason.
   * POST /api/v1/users/:id/suspend
   */
  public suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const reason = req.body.reason || "Suspended by supervisor";

      const updatedUser = await this.usersService.suspendUser(id, reason, actor);

      ResponseBuilder.success(res, updatedUser, {
        message: "User account suspended successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reactivates a suspended user.
   * POST /api/v1/users/:id/reactivate
   */
  public reactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updatedUser = await this.usersService.reactivateUser(id, actor);

      ResponseBuilder.success(res, updatedUser, {
        message: "User account reactivated successfully",
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

  /**
   * Retrieves performance metrics for a user.
   * GET /api/v1/users/:id/performance
   */
  public getUserPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const performance = await this.usersService.getUserPerformance(id, actor);

      ResponseBuilder.success(res, performance, {
        message: "User performance retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates user performance metrics (Supervisor/Admin only).
   * PATCH /api/v1/users/:id/performance
   */
  public updateUserPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.usersService.updateUserPerformance(id, req.body, actor);

      ResponseBuilder.success(res, updated, {
        message: "User performance updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves available ranks.
   * GET /api/v1/users/meta/ranks
   */
  public getRanks = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ranks = await this.usersService.getRanks();
      ResponseBuilder.success(res, ranks, {
        message: "Ranks retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves performance leaderboard.
   * GET /api/v1/users/meta/leaderboard
   */
  public getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const leaderboard = await this.usersService.getLeaderboard(limit);
      ResponseBuilder.success(res, leaderboard, {
        message: "Leaderboard retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves organizational hierarchy tree.
   * GET /api/v1/users/team-tree
   */
  public getTeamTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;
      const organizationId = (req.query.organizationId as string) || (authReq.user as any)?.organizationId;

      const tree = await this.usersService.getTeamTree(actor, organizationId);
      ResponseBuilder.success(res, tree, {
        message: "Organization team hierarchy retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
