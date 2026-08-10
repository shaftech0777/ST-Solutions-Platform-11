import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { auditService as defaultAuditService, AuditService } from "./audit.service.js";

/**
 * Controller class managing HTTP request handlers for Audit Logging.
 */
export class AuditController {
  private readonly auditService: AuditService;

  constructor(auditService: AuditService = defaultAuditService) {
    this.auditService = auditService;
  }

  /**
   * GET /api/v1/audit-logs
   * Retrieves paginated list of audit logs with filtering.
   */
  public getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as any;
      const result = await this.auditService.getAuditLogs(query);

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
   * GET /api/v1/audit-logs/statistics
   * Retrieves summary statistics for audit logging dashboard.
   */
  public getStatistics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.auditService.getStatistics();

      ResponseBuilder.success(res, stats, {
        message: "Audit logs statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/audit-logs/:auditId
   * Retrieves detailed information for a single audit log entry.
   */
  public getAuditLogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { auditId } = req.params;
      const log = await this.auditService.getAuditLogById(auditId);

      ResponseBuilder.success(res, log, {
        message: "Audit log details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const auditController = new AuditController();
