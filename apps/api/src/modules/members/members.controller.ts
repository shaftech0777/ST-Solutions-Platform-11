import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { membersService as defaultMembersService, MembersService } from "./members.service.js";
import {
  UpdateMemberProfileInputSchema,
  UpdateMemberRankInputSchema,
  UpdateMemberStatusInputSchema,
} from "./members.validation.js";

/**
 * Controller class managing HTTP endpoints for Members operations.
 */
export class MembersController {
  private readonly membersService: MembersService;

  constructor(membersService: MembersService = defaultMembersService) {
    this.membersService = membersService;
  }

  /**
   * GET /api/v1/members
   * Retrieves paginated list of members.
   */
  public getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const result = await this.membersService.getMembers(query);

      ResponseBuilder.paginated(res, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalRecords: result.pagination.total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/members/statistics
   * Retrieves high-level aggregate statistics for members.
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.membersService.getStatistics();

      ResponseBuilder.success(res, stats, {
        message: "Member statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/members/me
   * Retrieves member profile of currently authenticated user.
   */
  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const member = await this.membersService.getMemberByUserId(userId);

      ResponseBuilder.success(res, member, {
        message: "Current member profile retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/members/:memberId
   * Retrieves detailed information for a single member.
   */
  public getMemberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { memberId } = req.params;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const member = await this.membersService.getMemberById(memberId, actor);

      ResponseBuilder.success(res, member, {
        message: "Member details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/members/:memberId/profile
   * Updates member profile information.
   */
  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { memberId } = req.params;
      const body = req.body as UpdateMemberProfileInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user!.accountType as AccountType,
      };

      const updated = await this.membersService.updateProfile(memberId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Member profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/members/:memberId/status
   * Updates member status.
   */
  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { memberId } = req.params;
      const body = req.body as UpdateMemberStatusInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user!.accountType as AccountType,
      };

      const updated = await this.membersService.updateStatus(memberId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Member status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/members/:memberId/rank
   * Updates member rank.
   */
  public updateRank = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { memberId } = req.params;
      const body = req.body as UpdateMemberRankInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user!.accountType as AccountType,
      };

      const updated = await this.membersService.updateRank(memberId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Member rank updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/members/:memberId
   * Deactivates / removes a member.
   */
  public deactivateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { memberId } = req.params;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user!.accountType as AccountType,
      };

      const updated = await this.membersService.deactivateMember(memberId, actor);

      ResponseBuilder.success(res, updated, {
        message: "Member deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const membersController = new MembersController();
