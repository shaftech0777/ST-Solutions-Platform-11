import { Request } from "express";
import { NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { sanitizeAuditDescription, sanitizeAuditLogResponse } from "./audit.mapper.js";
import { auditRepository as defaultAuditRepository, AuditRepository } from "./audit.repository.js";
import {
  AuditLogQueryFilters,
  AuditLogResponse,
  AuditLogStatistics,
  CreateAuditLogInput,
} from "./audit.types.js";

/**
 * Service providing centralized audit logging capabilities across the platform.
 */
export class AuditService {
  private readonly auditRepository: AuditRepository;

  constructor(auditRepository: AuditRepository = defaultAuditRepository) {
    this.auditRepository = auditRepository;
  }

  /**
   * Directly creates an audit log entry.
   */
  public async createAuditLog(input: CreateAuditLogInput): Promise<AuditLogResponse> {
    const cleanedDescription = sanitizeAuditDescription(input.description);

    const log = await this.auditRepository.create({
      action: input.action.trim().toUpperCase(),
      description: cleanedDescription,
      ipAddress: input.ipAddress?.trim() || null,
      ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
    });

    return sanitizeAuditLogResponse(log);
  }

  /**
   * Resilient, non-throwing audit logging helper for internal domain services.
   * Ensures that audit recording failures never break primary business transactions.
   */
  public async logAction(
    userId: string | null | undefined,
    action: string,
    description?: string | null,
    ipAddress?: string | null
  ): Promise<void> {
    try {
      const cleanedDescription = sanitizeAuditDescription(description);

      await this.auditRepository.create({
        action: action.trim().toUpperCase(),
        description: cleanedDescription,
        ipAddress: ipAddress?.trim() || null,
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      });
    } catch {
      // Intentionally suppress logging errors to prevent breaking core domain flows
    }
  }

  /**
   * Convenient helper to record audit events directly from an Express request context.
   */
  public async recordEvent(
    req: Request,
    action: string,
    description?: string | null
  ): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId || null;
    const ipAddress =
      req.ip ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      null;

    await this.logAction(userId, action, description, ipAddress);
  }

  /**
   * Retrieves paginated audit logs for administration portal.
   */
  public async getAuditLogs(filters: AuditLogQueryFilters): Promise<{
    items: AuditLogResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const { data, meta } = await this.auditRepository.findAndCount(filters);
    const sanitizedItems = data.map((log) => sanitizeAuditLogResponse(log));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves detailed audit log entry by ID.
   */
  public async getAuditLogById(id: string): Promise<AuditLogResponse> {
    const log = await this.auditRepository.findById(id);
    if (!log) {
      throw new NotFoundError("Audit log entry not found", ERROR_CODES.AUDIT_LOG_NOT_FOUND);
    }

    return sanitizeAuditLogResponse(log);
  }

  /**
   * Computes aggregate statistics for audit logging dashboard.
   */
  public async getStatistics(): Promise<AuditLogStatistics> {
    return this.auditRepository.getStatistics();
  }
}

export const auditService = new AuditService();
