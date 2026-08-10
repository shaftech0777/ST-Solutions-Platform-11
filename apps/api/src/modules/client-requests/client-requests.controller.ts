import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { clientRequestsService as defaultClientRequestsService, ClientRequestsService } from "./client-requests.service.js";
import {
  ConvertClientRequestInputSchema,
  CreateClientRequestInputSchema,
  UpdateClientRequestInputSchema,
  UpdateClientRequestStatusInputSchema,
} from "./client-requests.validation.js";

/**
 * Controller class managing HTTP request handlers for Client Requests & Lead Intake.
 */
export class ClientRequestsController {
  private readonly clientRequestsService: ClientRequestsService;

  constructor(clientRequestsService: ClientRequestsService = defaultClientRequestsService) {
    this.clientRequestsService = clientRequestsService;
  }

  /**
   * GET /api/v1/client-requests
   * Retrieves paginated list of client requests.
   */
  public getClientRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const result = await this.clientRequestsService.getClientRequests(query);

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
   * GET /api/v1/client-requests/statistics
   * Retrieves aggregate statistics for client requests.
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.clientRequestsService.getStatistics();

      ResponseBuilder.success(res, stats, {
        message: "Client requests statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/client-requests/:requestId
   * Retrieves detailed client request record by ID.
   */
  public getClientRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const request = await this.clientRequestsService.getClientRequestById(requestId);

      ResponseBuilder.success(res, request, {
        message: "Client request details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/client-requests
   * Submits a new client request / lead intake.
   */
  public createClientRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateClientRequestInputSchema;
      const created = await this.clientRequestsService.createClientRequest(body);

      ResponseBuilder.created(res, created, {
        message: "Client request submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/client-requests/:requestId
   * Updates an existing client request.
   */
  public updateClientRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const body = req.body as UpdateClientRequestInputSchema;
      const updated = await this.clientRequestsService.updateClientRequest(requestId, body);

      ResponseBuilder.success(res, updated, {
        message: "Client request updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/client-requests/:requestId/status
   * Updates status of a client request.
   */
  public updateClientRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const body = req.body as UpdateClientRequestStatusInputSchema;
      const updated = await this.clientRequestsService.updateClientRequestStatus(requestId, body);

      ResponseBuilder.success(res, updated, {
        message: "Client request status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/client-requests/:requestId/convert
   * Converts a client request into a Client record.
   */
  public convertToClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const body = req.body as ConvertClientRequestInputSchema;
      const result = await this.clientRequestsService.convertToClient(requestId, body);

      ResponseBuilder.success(res, result, {
        message: "Client request converted to client successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/client-requests/:requestId
   * Deletes a client request record.
   */
  public deleteClientRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      await this.clientRequestsService.deleteClientRequest(requestId);

      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const clientRequestsController = new ClientRequestsController();
