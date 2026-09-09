import crypto from "crypto";
import { config } from "../../config/index.js";
import { Logger } from "../../core/logger/index.js";
import { generateWebhookSignature, verifyWebhookSignature } from "./automation.signature.js";
import { automationRepository, AutomationRepository } from "./automation.repository.js";
import {
  AUTOMATION_EVENTS,
  AutomationDispatchOptions,
  AutomationDispatchResult,
  AutomationLogQueryFilters,
  AutomationPayloadEnvelope,
  AutomationStatus,
  AutomationStatusResponse,
  N8nInboundCallbackPayload,
} from "./automation.types.js";

/**
 * Enterprise n8n Automation & Email Dispatcher Service.
 * Acts as the secure, non-blocking gateway between platform business logic and n8n workflows.
 */
export class AutomationService {
  private readonly repository: AutomationRepository;

  constructor(repository: AutomationRepository = automationRepository) {
    this.repository = repository;
  }

  /**
   * Sanitizes any payload before logging or dispatching to eliminate passwords or private tokens.
   */
  private sanitizePayload<T>(data: T): T {
    if (!data || typeof data !== "object") return data;
    const clone: any = Array.isArray(data) ? [...data] : { ...data };

    const sensitiveFields = [
      "password",
      "passwordHash",
      "token",
      "jwtSecret",
      "apiKey",
      "secret",
      "creditCard",
      "ssn",
    ];

    for (const key of Object.keys(clone)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        clone[key] = "[REDACTED]";
      } else if (typeof clone[key] === "object" && clone[key] !== null) {
        clone[key] = this.sanitizePayload(clone[key]);
      }
    }

    return clone;
  }

  /**
   * Dispatches an automation event to n8n.
   * If syncWait is false (default for public visitor endpoints), it persists PENDING and dispatches in the background.
   */
  public async dispatch<T = Record<string, any>>(
    eventName: string,
    data: T,
    options?: AutomationDispatchOptions
  ): Promise<AutomationDispatchResult> {
    const deliveryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const recipient = options?.recipient || null;
    const sanitizedData = this.sanitizePayload(data);

    const envelope: AutomationPayloadEnvelope<T> = {
      deliveryId,
      eventName,
      timestamp,
      source: "st-solutions-platform",
      environment: config.env || "development",
      recipient,
      adminNotificationEmail: config.n8n.adminNotificationEmail,
      data: sanitizedData,
    };

    // Step 1: Persist initial delivery log in PostgreSQL
    await this.repository.createLog({
      event: eventName,
      deliveryId,
      recipient,
      payload: envelope,
      status: "PENDING",
    });

    // If caller wants immediate async return, queue execution via setImmediate
    if (!options?.syncWait) {
      setImmediate(() => {
        this.executeDelivery(deliveryId, envelope).catch((err) => {
          Logger.warn({ err, deliveryId, eventName }, "[AutomationService] Background delivery encountered error");
        });
      });

      return {
        deliveryId,
        status: "PENDING",
      };
    }

    // Otherwise execute synchronously (e.g. for test dispatches)
    return await this.executeDelivery(deliveryId, envelope);
  }

  /**
   * Internal execution engine that handles the HTTP dispatch to n8n.
   */
  private async executeDelivery(
    deliveryId: string,
    envelope: AutomationPayloadEnvelope
  ): Promise<AutomationDispatchResult> {
    const isEnabled = Boolean(config.n8n.enabled && config.n8n.baseUrl);

    // If n8n is disabled or not configured, record skipped status gracefully
    if (!isEnabled) {
      Logger.info(
        { deliveryId, event: envelope.eventName },
        "[AutomationService] n8n integration not configured or disabled; dispatch recorded locally."
      );

      await this.repository.updateLog(deliveryId, {
        status: "DELIVERED",
        responseCode: 200,
        responseBody: JSON.stringify({ message: "Simulated local delivery (n8n disabled or not configured)" }),
        deliveredAt: new Date(),
      });

      return {
        deliveryId,
        status: "DELIVERED",
        responseCode: 200,
        deliveredAt: new Date(),
      };
    }

    const rawPayload = JSON.stringify(envelope);
    const signature = generateWebhookSignature(rawPayload, config.n8n.webhookSecret);

    // Build the target webhook URL
    // Standard convention: POST <N8N_BASE_URL>/webhook/st-solutions or <N8N_BASE_URL>/webhook/<event-slug>
    const baseUrl = config.n8n.baseUrl.replace(/\/$/, "");
    const eventSlug = envelope.eventName.replace(/[\._]/g, "-");
    const targetUrl = `${baseUrl}/webhook/${eventSlug}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "ST-Solutions-Backend/1.0",
      "X-ST-Signature": signature,
      "X-ST-Timestamp": envelope.timestamp,
      "X-ST-Event": envelope.eventName,
      "X-ST-Delivery-Id": deliveryId,
    };

    if (config.n8n.webhookSecret) {
      headers["X-Webhook-Secret"] = config.n8n.webhookSecret;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.n8n.timeoutMs);

    try {
      Logger.info(
        { deliveryId, event: envelope.eventName, targetUrl },
        `[AutomationService] Dispatching webhook to n8n`
      );

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: rawPayload,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseText = await response.text();
      let parsedBody: any = null;
      try {
        parsedBody = JSON.parse(responseText);
      } catch {
        parsedBody = { raw: responseText.slice(0, 500) };
      }

      const isSuccess = response.status >= 200 && response.status < 300;
      const status: AutomationStatus = isSuccess ? "DELIVERED" : "FAILED";
      const providerMsgId = parsedBody?.messageId || parsedBody?.id || null;

      await this.repository.updateLog(deliveryId, {
        status,
        attempts: 1,
        responseCode: response.status,
        responseBody: typeof parsedBody === "string" ? parsedBody : JSON.stringify(parsedBody),
        providerMsgId,
        failureReason: isSuccess ? null : `n8n responded with HTTP status ${response.status}`,
        deliveredAt: isSuccess ? new Date() : null,
      });

      Logger.info(
        { deliveryId, event: envelope.eventName, statusCode: response.status, isSuccess },
        `[AutomationService] n8n dispatch completed with status ${response.status}`
      );

      return {
        deliveryId,
        status,
        responseCode: response.status,
        providerMsgId,
        deliveredAt: isSuccess ? new Date() : null,
      };
    } catch (err: any) {
      clearTimeout(timeout);

      const isAbort = err.name === "AbortError";
      const failureReason = isAbort
        ? `Request timed out after ${config.n8n.timeoutMs}ms`
        : err?.message || "Network error connecting to n8n";

      Logger.warn(
        { deliveryId, event: envelope.eventName, failureReason },
        `[AutomationService] n8n delivery failed (resilient non-blocking catch)`
      );

      await this.repository.updateLog(deliveryId, {
        status: "FAILED",
        attempts: 1,
        responseCode: isAbort ? 504 : 502,
        failureReason,
      });

      return {
        deliveryId,
        status: "FAILED",
        failureReason,
        responseCode: isAbort ? 504 : 502,
      };
    }
  }

  /**
   * Processes inbound webhook callback from n8n (delivery confirmations, provider message IDs, bounce events).
   */
  public async processCallback(
    payload: N8nInboundCallbackPayload,
    headers: Record<string, any>,
    rawBody?: string
  ): Promise<{ success: boolean; message: string }> {
    const { deliveryId, status, providerMessageId, failureReason, responseCode } = payload;

    if (!deliveryId) {
      return { success: false, message: "Missing deliveryId in callback payload" };
    }

    // Verify authentication if secret is configured
    if (config.n8n.webhookSecret) {
      const signatureHeader = headers["x-st-signature"] || headers["x-signature"];
      const secretHeader = headers["x-webhook-secret"] || headers["x-secret-token"] || headers["authorization"];

      const isSecretHeaderMatch = secretHeader && (
        secretHeader === config.n8n.webhookSecret ||
        secretHeader === `Bearer ${config.n8n.webhookSecret}`
      );

      let isSignatureMatch = false;
      if (signatureHeader && rawBody) {
        const verifyResult = verifyWebhookSignature(rawBody, signatureHeader, config.n8n.webhookSecret);
        isSignatureMatch = verifyResult.isValid;
      }

      if (!isSecretHeaderMatch && !isSignatureMatch) {
        return { success: false, message: "Unauthorized callback: signature or secret token mismatch" };
      }
    }

    const log = await this.repository.findLogByDeliveryId(deliveryId);
    if (!log) {
      return { success: false, message: `No delivery log found for deliveryId '${deliveryId}'` };
    }

    const mappedStatus: AutomationStatus =
      status === "DELIVERED" ? "DELIVERED" : status === "BOUNCED" ? "FAILED" : "FAILED";

    await this.repository.updateLog(deliveryId, {
      status: mappedStatus,
      providerMsgId: providerMessageId || log.providerMsgId,
      responseCode: responseCode || 200,
      failureReason: failureReason || (status === "BOUNCED" ? "Email bounced by provider" : null),
      deliveredAt: mappedStatus === "DELIVERED" ? new Date() : log.deliveredAt,
    });

    Logger.info(
      { deliveryId, status: mappedStatus, providerMessageId },
      `[AutomationService] Processed n8n callback for delivery '${deliveryId}'`
    );

    return { success: true, message: `Delivery record updated to ${mappedStatus}` };
  }

  /**
   * Returns overall automation system health, configuration, and delivery metrics for administrators.
   */
  public async getSystemStatus(): Promise<AutomationStatusResponse> {
    const stats = await this.repository.getDeliveryStats();

    return {
      enabled: config.n8n.enabled,
      baseUrl: config.n8n.baseUrl,
      configured: Boolean(config.n8n.baseUrl && config.n8n.baseUrl.trim().length > 0),
      webhookSecretConfigured: Boolean(config.n8n.webhookSecret && config.n8n.webhookSecret.trim().length > 0),
      adminNotificationEmail: config.n8n.adminNotificationEmail,
      timeoutMs: config.n8n.timeoutMs,
      deliveryStats: {
        total: stats.total,
        delivered: stats.delivered,
        failed: stats.failed,
        pending: stats.pending,
      },
      lastDeliveredAt: stats.lastDeliveredAt,
    };
  }

  /**
   * Retrieves paginated delivery logs for administrator audit view.
   */
  public async getLogs(filters: AutomationLogQueryFilters) {
    return await this.repository.findLogs(filters);
  }

  /**
   * Triggers a manual test dispatch from admin panel to verify n8n connectivity and flow execution.
   */
  public async sendTestEvent(recipientEmail?: string): Promise<AutomationDispatchResult> {
    const targetEmail = recipientEmail || config.n8n.adminNotificationEmail;

    return await this.dispatch(
      AUTOMATION_EVENTS.SYSTEM_TEST_DISPATCHED,
      {
        testType: "ADMIN_CONNECTIVITY_PING",
        initiatedAt: new Date().toISOString(),
        targetEmail,
        systemVersion: "1.0.0",
        message: "This is a verified test automation event from ST-Solutions Enterprise Backend.",
      },
      {
        recipient: targetEmail,
        syncWait: true,
      }
    );
  }
}

export const automationService = new AutomationService();
