import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { workspaceService as defaultWorkspaceService, WorkspaceService } from "./workspace.service.js";
import { AddWorkspaceMemberInput, CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspace.validation.js";

export class WorkspaceController {
  private readonly workspaceService: WorkspaceService;

  constructor(workspaceService: WorkspaceService = defaultWorkspaceService) {
    this.workspaceService = workspaceService;
  }

  public createWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const dto = req.body as CreateWorkspaceInput;

      const result = await this.workspaceService.createWorkspace(userId, dto);
      ResponseBuilder.created(res, result, { message: "Workspace created successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getOrganizationWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { organizationId } = req.query;

      const result = await this.workspaceService.getOrganizationWorkspaces(organizationId as string, userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public getWorkspaceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;

      const result = await this.workspaceService.getWorkspaceById(id, userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public updateWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;
      const dto = req.body as UpdateWorkspaceInput;

      const result = await this.workspaceService.updateWorkspace(id, userId, dto);
      ResponseBuilder.success(res, result, { message: "Workspace updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  public deleteWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;

      const result = await this.workspaceService.deleteWorkspace(id, userId);
      ResponseBuilder.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  public addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const { id } = req.params;
      const dto = req.body as AddWorkspaceMemberInput;

      const result = await this.workspaceService.addMember(id, userId, dto);
      ResponseBuilder.created(res, result, { message: "Member added to workspace" });
    } catch (error) {
      next(error);
    }
  };
}

export const workspaceController = new WorkspaceController();
