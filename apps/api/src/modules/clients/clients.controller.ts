import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { clientsService as defaultClientsService, ClientsService } from "./clients.service.js";
import {
  CreateClientInputSchema,
  UpdateClientInputSchema,
  UpdateClientOwnershipInputSchema,
  UpdateClientStatusInputSchema,
} from "./clients.validation.js";

/**
 * Controller class managing HTTP endpoints for Client operations.
 */
export class ClientsController {
  private readonly clientsService: ClientsService;

  constructor(clientsService: ClientsService = defaultClientsService) {
    this.clientsService = clientsService;
  }

  /**
   * GET /api/v1/clients
   * Retrieves paginated list of clients.
   */
  public getClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const result = await this.clientsService.getClients(query);

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
   * GET /api/v1/clients/statistics
   * Retrieves high-level aggregate statistics for clients.
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.clientsService.getStatistics();

      ResponseBuilder.success(res, stats, {
        message: "Client statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/clients/:clientId
   * Retrieves detailed client record by ID.
   */
  public getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId } = req.params;
      const client = await this.clientsService.getClientById(clientId);

      ResponseBuilder.success(res, client, {
        message: "Client details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/clients
   * Creates a new client.
   */
  public createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const body = req.body as CreateClientInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const created = await this.clientsService.createClient(body, actor);

      ResponseBuilder.created(res, created, {
        message: "Client created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/clients/:clientId
   * Updates existing client details.
   */
  public updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { clientId } = req.params;
      const body = req.body as UpdateClientInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.clientsService.updateClient(clientId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Client updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/clients/:clientId/status
   * Updates client status.
   */
  public updateClientStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { clientId } = req.params;
      const body = req.body as UpdateClientStatusInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.clientsService.updateClientStatus(clientId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Client status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/clients/:clientId/owner
   * Updates client ownership (member/manager assignment).
   */
  public updateClientOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { clientId } = req.params;
      const body = req.body as UpdateClientOwnershipInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.clientsService.updateClientOwnership(clientId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Client ownership updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const clientsController = new ClientsController();
