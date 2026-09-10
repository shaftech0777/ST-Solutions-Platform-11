import { prisma } from "../../database/prisma.client.js";
import { AutomationLogQueryFilters, AutomationStatus } from "./automation.types.js";
import { AutomationDeliveryStatus } from "@prisma/client";

export class AutomationRepository {
  /**
   * Creates an initial automation delivery log in PostgreSQL (Outbox entry).
   */
  public async createLog(data: {
    event?: string;
    eventName?: string;
    deliveryId: string;
    recipient?: string | null;
    payload: any;
    status?: AutomationStatus;
    attempts?: number;
    maxAttempts?: number;
    nextRetryAt?: Date | null;
  }) {
    const eventName = data.event || data.eventName || "unknown.event";
    const initialStatus = (data.status as AutomationDeliveryStatus) || AutomationDeliveryStatus.PENDING;

    try {
      const created = await prisma.automationLog.create({
        data: {
          event: eventName,
          deliveryId: data.deliveryId,
          recipient: data.recipient || null,
          payload: data.payload,
          status: initialStatus,
          attempts: data.attempts ?? 0,
          maxAttempts: data.maxAttempts ?? 4,
          nextRetryAt: data.nextRetryAt ?? null,
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
            success: initialStatus === AutomationDeliveryStatus.DELIVERED,
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
   * Finds pending or retrying outbox items that are due for delivery attempt.
   */
  public async findPendingRetries(limit = 10) {
    const now = new Date();
    try {
      return await prisma.automationLog.findMany({
        where: {
          status: {
            in: [AutomationDeliveryStatus.PENDING, AutomationDeliveryStatus.RETRYING],
          },
          OR: [
            { nextRetryAt: null },
            { nextRetryAt: { lte: now } },
          ],
          attempts: { lt: 4 },
        },
        orderBy: { createdAt: "asc" },
        take: limit,
      });
    } catch {
      return [];
    }
  }

  /**
   * Atomically transitions a log to PROCESSING state before network dispatch.
   */
  public async markProcessing(deliveryId: string) {
    try {
      return await prisma.automationLog.update({
        where: { deliveryId },
        data: {
          status: AutomationDeliveryStatus.PROCESSING,
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Marks a log as ACCEPTED_BY_N8N upon receiving HTTP 2xx from n8n webhook.
   * Note: This does NOT overwrite final statuses (SENT, DELIVERED, BOUNCED, FAILED)
   * if a callback has already reported the final outcome.
   */
  public async markAccepted(
    deliveryId: string,
    responseCode: number,
    responseBody: string | null,
    providerMsgId?: string | null
  ) {
    try {
      const current = await prisma.automationLog.findUnique({ where: { deliveryId } });
      const finalStatuses: AutomationDeliveryStatus[] = [
        AutomationDeliveryStatus.SENT,
        AutomationDeliveryStatus.DELIVERED,
        AutomationDeliveryStatus.BOUNCED,
        AutomationDeliveryStatus.FAILED,
      ];
      const hasReachedFinalStatus =
        current !== null && finalStatuses.includes(current.status);

      return await prisma.automationLog.update({
        where: { deliveryId },
        data: {
          ...(hasReachedFinalStatus ? {} : { status: AutomationDeliveryStatus.ACCEPTED_BY_N8N }),
          responseCode,
          responseBody,
          providerMsgId: providerMsgId || current?.providerMsgId || null,
          processedAt: new Date(),
          nextRetryAt: null,
          failureReason: null,
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Records a failed delivery attempt and computes exponential backoff retry schedule.
   */
  public async markFailedOrRetry(
    deliveryId: string,
    failureReason: string,
    responseCode?: number | null,
    responseBody?: string | null,
    nextRetryDelaySeconds?: number
  ) {
    try {
      const current = await prisma.automationLog.findUnique({ where: { deliveryId } });
      const attempts = current ? current.attempts : 1;
      const maxAttempts = current ? current.maxAttempts : 4;

      const isExhausted = attempts >= maxAttempts || !nextRetryDelaySeconds;
      const nextStatus = isExhausted
        ? AutomationDeliveryStatus.FAILED
        : AutomationDeliveryStatus.RETRYING;

      const nextRetryAt = isExhausted
        ? null
        : new Date(Date.now() + nextRetryDelaySeconds * 1000);

      return await prisma.automationLog.update({
        where: { deliveryId },
        data: {
          status: nextStatus,
          responseCode: responseCode ?? null,
          responseBody: responseBody ?? null,
          failureReason,
          nextRetryAt,
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Updates an existing delivery log after dispatch attempt or callback.
   */
  public async updateLog(
    deliveryId: string,
    data: {
      status?: AutomationStatus;
      attempts?: number;
      maxAttempts?: number;
      nextRetryAt?: Date | null;
      lastAttemptAt?: Date | null;
      processedAt?: Date | null;
      responseCode?: number | null;
      responseBody?: string | null;
      providerMsgId?: string | null;
      failureReason?: string | null;
      deliveredAt?: Date | null;
    }
  ) {
    try {
      const updateData: any = {};
      if (data.status) updateData.status = data.status as AutomationDeliveryStatus;
      if (data.attempts !== undefined) updateData.attempts = data.attempts;
      if (data.maxAttempts !== undefined) updateData.maxAttempts = data.maxAttempts;
      if (data.nextRetryAt !== undefined) updateData.nextRetryAt = data.nextRetryAt;
      if (data.lastAttemptAt !== undefined) updateData.lastAttemptAt = data.lastAttemptAt;
      if (data.processedAt !== undefined) updateData.processedAt = data.processedAt;
      if (data.responseCode !== undefined) updateData.responseCode = data.responseCode;
      if (data.responseBody !== undefined) updateData.responseBody = data.responseBody;
      if (data.providerMsgId !== undefined) updateData.providerMsgId = data.providerMsgId;
      if (data.failureReason !== undefined) updateData.failureReason = data.failureReason;
      if (data.deliveredAt !== undefined) updateData.deliveredAt = data.deliveredAt;

      return await prisma.automationLog.update({
        where: { deliveryId },
        data: updateData,
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
      where.status = filters.status as AutomationDeliveryStatus;
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
      const [total, delivered, accepted, failed, pending, retrying, lastDelivered] = await Promise.all([
        prisma.automationLog.count(),
        prisma.automationLog.count({ where: { status: AutomationDeliveryStatus.DELIVERED } }),
        prisma.automationLog.count({ where: { status: AutomationDeliveryStatus.ACCEPTED_BY_N8N } }),
        prisma.automationLog.count({ where: { status: AutomationDeliveryStatus.FAILED } }),
        prisma.automationLog.count({ where: { status: AutomationDeliveryStatus.PENDING } }),
        prisma.automationLog.count({ where: { status: AutomationDeliveryStatus.RETRYING } }),
        prisma.automationLog.findFirst({
          where: { status: AutomationDeliveryStatus.DELIVERED },
          orderBy: { deliveredAt: "desc" },
          select: { deliveredAt: true },
        }),
      ]);

      return {
        total,
        delivered,
        accepted,
        failed,
        pending,
        retrying,
        lastDeliveredAt: lastDelivered?.deliveredAt || null,
      };
    } catch {
      return {
        total: 0,
        delivered: 0,
        accepted: 0,
        failed: 0,
        pending: 0,
        retrying: 0,
        lastDeliveredAt: null,
      };
    }
  }
}

export const automationRepository = new AutomationRepository();
