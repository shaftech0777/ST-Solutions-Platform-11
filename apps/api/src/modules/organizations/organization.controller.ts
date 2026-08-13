import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { organizationService as defaultOrgService, OrganizationService } from "./organization.service.js";
import {
  AcceptInvitationInput,
  CreateOrganizationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "./organization.validation.js";

export class OrganizationController {
  private readonly orgService: OrganizationService;

  constructor(orgService: OrganizationService = defaultOrgService) {
    this.orgService = orgService;
  }

  public createOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const dto = req.body as CreateOrganizationInput;

      const result = await this.orgService.createOrganization(userId, dto);
      ResponseBuilder.created(res, result, { message: "Organization created successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getUserOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const result = await this.orgService.getUserOrganizations(userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public getOrganizationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;

      const result = await this.orgService.getOrganizationById(id, userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public updateOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;
      const dto = req.body as UpdateOrganizationInput;

      const result = await this.orgService.updateOrganization(id, userId, dto);
      ResponseBuilder.success(res, result, { message: "Organization updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;

      const result = await this.orgService.getMembers(id, userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public inviteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;
      const dto = req.body as InviteMemberInput;

      const result = await this.orgService.inviteMember(id, userId, dto);
      ResponseBuilder.created(res, result, { message: "Member invitation sent" });
    } catch (error) {
      next(error);
    }
  };

  public acceptInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const dto = req.body as AcceptInvitationInput;

      const result = await this.orgService.acceptInvitation(dto, userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id, memberId } = req.params;
      const dto = req.body as UpdateMemberRoleInput;

      const result = await this.orgService.updateMemberRole(id, userId, memberId, dto);
      ResponseBuilder.success(res, result, { message: "Member role updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  public removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id, memberId } = req.params;

      const result = await this.orgService.removeMember(id, userId, memberId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const organizationController = new OrganizationController();
