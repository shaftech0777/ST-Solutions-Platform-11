import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { paymentsService as defaultPaymentsService, PaymentsService } from "./payments.service.js";
import {
  CreatePaymentInputSchema,
  UpdatePaymentInputSchema,
  UpdatePaymentStatusInputSchema,
} from "./payments.validation.js";

/**
 * Controller class managing HTTP request handlers for Payment & Financial operations.
 */
export class PaymentsController {
  private readonly paymentsService: PaymentsService;

  constructor(paymentsService: PaymentsService = defaultPaymentsService) {
    this.paymentsService = paymentsService;
  }

  /**
   * GET /api/v1/payments
   * Retrieves paginated list of payments with filtering.
   */
  public getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const result = await this.paymentsService.getPayments(query);

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
   * GET /api/v1/payments/statistics
   * Retrieves aggregate statistics for payments & financials.
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.paymentsService.getStatistics();

      ResponseBuilder.success(res, stats, {
        message: "Payment statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/payments/:paymentId
   * Retrieves detailed payment record by ID.
   */
  public getPaymentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId } = req.params;
      const payment = await this.paymentsService.getPaymentById(paymentId);

      ResponseBuilder.success(res, payment, {
        message: "Payment details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/payments
   * Creates a new payment entry.
   */
  public createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const body = req.body as CreatePaymentInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user?.accountType as AccountType,
      };

      const created = await this.paymentsService.createPayment(body, actor);

      ResponseBuilder.created(res, created, {
        message: "Payment record created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/payments/:paymentId
   * Updates existing payment details.
   */
  public updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { paymentId } = req.params;
      const body = req.body as UpdatePaymentInputSchema;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.paymentsService.updatePayment(paymentId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Payment record updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/payments/:paymentId/status
   * Updates payment status.
   */
  public updatePaymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { paymentId } = req.params;
      const body = req.body as UpdatePaymentStatusInputSchema;
      const actor = {
        userId: authReq.user!.userId,
        accountType: authReq.user?.accountType as AccountType,
      };

      const updated = await this.paymentsService.updatePaymentStatus(paymentId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Payment status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/payments/:paymentId
   * Deletes a payment record.
   */
  public deletePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId } = req.params;
      await this.paymentsService.deletePayment(paymentId);

      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const paymentsController = new PaymentsController();
