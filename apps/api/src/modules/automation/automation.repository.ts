import { prisma } from "../../database/prisma.client.js";
import { AutomationLogQueryFilters, AutomationStatus } from "./automation.types.js";

export class AutomationRepository {
  /**
   * Creates an initial automation delivery log in PostgreSQL.
   */
  public async createLog(data: {
    event?: string;
    eventName?: string;
    deliveryId: string;
    recipient?: string | null;
    payload: any;
    status: AutomationStatus;
    attempts?: number;
    retryCount?: number;
    maxRetries?: number;
  }) {
    const eventName = data.event || data.eventName || "unknown.event";
    let mappedStatus: "PENDING" | "DELIVERED" | "FAILED" | "RETRYING" = "PENDING";
    if (data.status === "DELIVERED" || data.status === "FAILED" || data.status === "RETRYING") {
      mappedStatus = data.status;
    }

    try {
      const created = await prisma.automationLog.create({
        data: {
          event: eventName,
          deliveryId: data.deliveryId,
          recipient: data.recipient || null,
          payload: data.payload,
          status: mappedStatus,
          attempts: data.attempts ?? data.retryCount ?? 0,
        },
      });

      // Also record in legacy communication log for unified client/contact view
      try {
        await prisma.communicationLog.create({
          data: {
            type: `N8N_AUTOMATION:${eventName}`,
            destination: data.recipient || "ADMIN_WEBHOOK",
            subject: `Automated Workflow: ${eventName}`,
            content: typeof data.payload === "string" ? data.payload : JSON.stringify(data.payload),
            success: data.status === "DELIVERED",
          },
        });
      } catch {
        // Non-blocking catch for secondary communication log
      }

      return created;
    } catch (err) {
      console.warn("[AutomationRepository] Warning: failed to persist automation log:", err);
      return null;
    }
  }

  /**
   * Alias for updating status.
   */
  public async updateStatus(
    deliveryId: string,
    data: {
      status: AutomationStatus;
      responseCode?: number | null;
      deliveredAt?: Date | null;
      failureReason?: string | null;
    }
  ) {
    return this.updateLog(deliveryId, {
      status: data.status,
      responseCode: data.responseCode,
      failureReason: data.failureReason,
    });
  }

  /**
   * Alias for listing logs.
   */
  public async listLogs(page = 1, limit = 50) {
    return this.findLogs({}, page, limit);
  }

  /**
   * Updates an existing delivery log after dispatch attempt or callback.
   */
  public async updateLog(
    deliveryId: string,
    data: {
      status: AutomationStatus;
      attempts?: number;
      responseCode?: number | null;
      responseBody?: string | null;
      providerMsgId?: string | null;
      failureReason?: string | null;
      deliveredAt?: Date | null;
    }
  ) {
    let mappedStatus: "PENDING" | "DELIVERED" | "FAILED" | "RETRYING" = "PENDING";
    if (data.status === "DELIVERED" || data.status === "FAILED" || data.status === "RETRYING") {
      mappedStatus = data.status;
    }

    try {
      return await prisma.automationLog.update({
        where: { deliveryId },
        data: {
          status: mappedStatus,
          ...(data.attempts !== undefined ? { attempts: data.attempts } : {}),
          ...(data.responseCode !== undefined ? { responseCode: data.responseCode } : {}),
          ...(data.responseBody !== undefined ? { responseBody: data.responseBody } : {}),
          ...(data.providerMsgId !== undefined ? { providerMsgId: data.providerMsgId } : {}),
          ...(data.failureReason !== undefined ? { failureReason: data.failureReason } : {}),
          ...(data.deliveredAt !== undefined ? { deliveredAt: data.deliveredAt } : {}),
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Finds a log by unique delivery ID.
   */
  public async findLogByDeliveryId(deliveryId: string) {
    try {
      return await prisma.automationLog.findUnique({
        where: { deliveryId },
      });
    } catch {
      return null;
    }
  }

  public async findByDeliveryId(deliveryId: string) {
    return this.findLogByDeliveryId(deliveryId);
  }

  /**
   * Queries paginated automation logs for admin monitoring.
   */
  public async findLogs(filters: AutomationLogQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.event) {
      where.event = filters.event;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.recipient) {
      where.recipient = { contains: filters.recipient, mode: "insensitive" };
    }

    try {
      const [items, total] = await Promise.all([
        prisma.automationLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.automationLog.count({ where }),
      ]);

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch {
      return {
        items: [],
        pagination: { total: 0, page, limit, totalPages: 1 },
      };
    }
  }

  /**
   * Aggregates automation telemetry for admin status dashboard.
   */
  public async getDeliveryStats() {
    try {
      const [total, delivered, failed, pending, lastDelivered] = await Promise.all([
        prisma.automationLog.count(),
        prisma.automationLog.count({ where: { status: "DELIVERED" } }),
        prisma.automationLog.count({ where: { status: "FAILED" } }),
        prisma.automationLog.count({ where: { status: { in: ["PENDING", "RETRYING"] } } }),
        prisma.automationLog.findFirst({
          where: { status: "DELIVERED" },
          orderBy: { deliveredAt: "desc" },
          select: { deliveredAt: true },
        }),
      ]);

      return {
        total,
        delivered,
        failed,
        pending,
        lastDeliveredAt: lastDelivered?.deliveredAt || null,
      };
    } catch {
      return {
        total: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
        lastDeliveredAt: null,
      };
    }
  }
}

export const automationRepository = new AutomationRepository();
