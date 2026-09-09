import crypto from "crypto";
import { config } from "../../config/index.js";
import { Logger } from "../../core/logger/index.js";
import {
  generateCanonicalSignature,
  verifyCanonicalWebhookSignature,
} from "./automation.signature.js";
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

const BACKOFF_DELAYS_SECONDS = [30, 120, 600, 1800]; // 30s, 2m, 10m, 30m

/**
 * Enterprise n8n Automation & Email Dispatcher Service.
 * Implements a durable transactional Outbox pattern, canonical HMAC SHA-256 signing,
 * exponential backoff retries, and strict delivery status semantics.
 */
export class AutomationService {
  private readonly repository: AutomationRepository;
  private retryWorkerTimer: NodeJS.Timeout | null = null;
  private isProcessingRetries = false;

  constructor(repository: AutomationRepository = automationRepository) {
    this.repository = repository;
    this.startRetryWorker();
  }

  /**
   * Sanitizes payload before serialization to prevent sensitive tokens,
   * passwords, or identity credentials from being logged or transmitted.
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
      "cnicNumber",
      "bankAccount",
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
   * Dispatches an automation event.
   * Step 1: Persists event in Outbox as PENDING (idempotent write).
   * Step 2: Asynchronously executes delivery to n8n.
   */
  public async dispatch<T = Record<string, any>>(
    eventName: string,
    data: T,
    options?: AutomationDispatchOptions
  ): Promise<AutomationDispatchResult> {
    const deliveryId = crypto.randomUUID();
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const recipient = options?.recipient || null;
    const sanitizedData = this.sanitizePayload(data);

    const envelope: AutomationPayloadEnvelope<T> = {
      eventId,
      eventType: eventName,
      occurredAt: timestamp,
      source: "st-solutions-platform",
      version: 1,
      deliveryId,
      eventName,
      timestamp,
      environment: config.env || "development",
      recipient,
      adminNotificationEmail: config.n8n.adminNotificationEmail,
      callbackUrl: config.n8n.callbackUrl,
      data: sanitizedData,
    };

    // Idempotency: Check if a log with this deliveryId already exists
    const existing = await this.repository.findLogByDeliveryId(deliveryId);
    if (existing && (existing.status === "ACCEPTED_BY_N8N" || existing.status === "DELIVERED")) {
      return {
        deliveryId: existing.deliveryId,
        status: existing.status as AutomationStatus,
        responseCode: existing.responseCode,
        providerMsgId: existing.providerMsgId,
        deliveredAt: existing.deliveredAt,
      };
    }

    // Persist in Outbox with initial PENDING status
    await this.repository.createLog({
      event: eventName,
      deliveryId,
      recipient,
      payload: envelope,
      status: "PENDING",
      maxAttempts: options?.maxRetries || 4,
    });

    if (!options?.syncWait) {
      // Async dispatch without blocking client response
      setImmediate(() => {
        this.executeDelivery(deliveryId, envelope).catch((err) => {
          Logger.warn({ err, deliveryId, eventName }, "[AutomationService] Background delivery attempt failed");
        });
      });

      return {
        deliveryId,
        status: "PENDING",
      };
    }

    // Synchronous wait (e.g. for Admin System Test dispatch)
    return await this.executeDelivery(deliveryId, envelope);
  }

  /**
   * Executes HTTP delivery to n8n webhook with canonical HMAC signature.
   */
  public async executeDelivery(
    deliveryId: string,
    envelope: AutomationPayloadEnvelope
  ): Promise<AutomationDispatchResult> {
    const isEnabled = Boolean(config.n8n.enabled && config.n8n.baseUrl);

    // If n8n integration is disabled, record simulated delivery locally
    if (!isEnabled) {
      Logger.info(
        { deliveryId, event: envelope.eventName },
        "[AutomationService] n8n integration disabled; recorded locally as SKIPPED."
      );

      await this.repository.updateLog(deliveryId, {
        status: "SKIPPED",
        responseCode: 200,
        responseBody: JSON.stringify({ message: "n8n integration disabled; recorded locally" }),
        deliveredAt: new Date(),
      });

      return {
        deliveryId,
        status: "SKIPPED",
        responseCode: 200,
        deliveredAt: new Date(),
      };
    }

    // Mark status as PROCESSING atomically in DB
    const logRecord = await this.repository.markProcessing(deliveryId);
    const attempt = logRecord?.attempts || 1;

    // Calculate canonical signature over `${timestamp}.${deliveryId}.${canonicalPayload}`
    const signature = generateCanonicalSignature(
      envelope.timestamp,
      deliveryId,
      envelope,
      config.n8n.webhookSecret
    );

    // Build target webhook URL (e.g. <N8N_BASE_URL>/webhook/<event-slug>)
    const baseUrl = config.n8n.baseUrl.replace(/\/$/, "");
    const eventSlug = envelope.eventName.replace(/[\._]/g, "-");
    const targetUrl = `${baseUrl}/webhook/${eventSlug}`;

    // STRICT SECURITY: Send ONLY public authentication metadata.
    // NEVER send the raw webhook secret over HTTP headers.
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "ST-Solutions-Backend/1.0",
      "X-ST-Signature": signature,
      "X-ST-Timestamp": envelope.timestamp,
      "X-ST-Delivery-Id": deliveryId,
      "X-ST-Event": envelope.eventName,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.n8n.timeoutMs);

    try {
      Logger.info(
        { deliveryId, event: envelope.eventName, attempt, targetUrl },
        `[AutomationService] Dispatching webhook to n8n (attempt ${attempt})`
      );

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(envelope),
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
      const providerMsgId = parsedBody?.messageId || parsedBody?.id || null;

      if (isSuccess) {
        // Correct semantics: HTTP 2xx from n8n = ACCEPTED_BY_N8N, not final inbox delivery
        await this.repository.markAccepted(
          deliveryId,
          response.status,
          typeof parsedBody === "string" ? parsedBody : JSON.stringify(parsedBody),
          providerMsgId
        );

        Logger.info(
          { deliveryId, event: envelope.eventName, statusCode: response.status },
          `[AutomationService] n8n accepted webhook (ACCEPTED_BY_N8N)`
        );

        return {
          deliveryId,
          status: "ACCEPTED_BY_N8N",
          responseCode: response.status,
          providerMsgId,
        };
      } else {
        // Non-2xx response from n8n
        const failureReason = `n8n responded with HTTP status ${response.status}`;
        const delaySeconds = BACKOFF_DELAYS_SECONDS[Math.min(attempt - 1, BACKOFF_DELAYS_SECONDS.length - 1)];

        await this.repository.markFailedOrRetry(
          deliveryId,
          failureReason,
          response.status,
          typeof parsedBody === "string" ? parsedBody : JSON.stringify(parsedBody),
          delaySeconds
        );

        Logger.warn(
          { deliveryId, attempt, statusCode: response.status, failureReason, nextRetryInSeconds: delaySeconds },
          `[AutomationService] n8n returned error; scheduled backoff retry`
        );

        return {
          deliveryId,
          status: attempt >= (logRecord?.maxAttempts || 4) ? "FAILED" : "RETRYING",
          responseCode: response.status,
          failureReason,
        };
      }
    } catch (err: any) {
      clearTimeout(timeout);

      const isAbort = err.name === "AbortError";
      const failureReason = isAbort
        ? `Request timed out after ${config.n8n.timeoutMs}ms`
        : err?.message || "Network error connecting to n8n";

      const delaySeconds = BACKOFF_DELAYS_SECONDS[Math.min(attempt - 1, BACKOFF_DELAYS_SECONDS.length - 1)];

      await this.repository.markFailedOrRetry(
        deliveryId,
        failureReason,
        isAbort ? 504 : 502,
        null,
        delaySeconds
      );

      Logger.warn(
        { deliveryId, attempt, failureReason, nextRetryInSeconds: delaySeconds },
        `[AutomationService] Network error dispatching to n8n; scheduled retry`
      );

      return {
        deliveryId,
        status: attempt >= (logRecord?.maxAttempts || 4) ? "FAILED" : "RETRYING",
        failureReason,
        responseCode: isAbort ? 504 : 502,
      };
    }
  }

  /**
   * Processes inbound webhook callback from n8n to report final provider delivery or failure.
   * Enforces canonical HMAC-SHA256 verification and replay attack rejection.
   */
  public async processCallback(
    payload: N8nInboundCallbackPayload,
    headers: Record<string, any>,
    rawBody?: string
  ): Promise<{ success: boolean; message: string; code?: string }> {
    const { deliveryId, status, providerMessageId, failureReason, responseCode } = payload;

    if (!deliveryId) {
      return { success: false, message: "Missing deliveryId in callback payload", code: "MISSING_DELIVERY_ID" };
    }

    // Canonical Authentication Check
    if (config.n8n.webhookSecret) {
      const signature = headers["x-st-signature"] || headers["x-signature"];
      const timestamp = headers["x-st-timestamp"] || headers["x-timestamp"];
      const headerDeliveryId = headers["x-st-delivery-id"] || headers["x-delivery-id"] || deliveryId;

      const verification = verifyCanonicalWebhookSignature({
        rawPayload: rawBody || payload,
        signature,
        timestamp,
        deliveryId: headerDeliveryId,
        secret: config.n8n.webhookSecret,
        maxAgeMs: 300000, // 5 minute freshness window
      });

      if (!verification.isValid) {
        Logger.warn(
          { deliveryId, reason: verification.reason, code: verification.code },
          "[AutomationService] Rejected unauthorized n8n callback"
        );
        return {
          success: false,
          message: verification.reason || "Unauthorized callback",
          code: verification.code || "UNAUTHORIZED",
        };
      }
    }

    const log = await this.repository.findLogByDeliveryId(deliveryId);
    if (!log) {
      return { success: false, message: `No delivery log found for deliveryId '${deliveryId}'`, code: "NOT_FOUND" };
    }

    // Map incoming status to AutomationStatus
    let mappedStatus: AutomationStatus = "ACCEPTED_BY_N8N";
    if (status === "DELIVERED") mappedStatus = "DELIVERED";
    else if (status === "SENT") mappedStatus = "SENT";
    else if (status === "BOUNCED") mappedStatus = "BOUNCED";
    else if (status === "FAILED") mappedStatus = "FAILED";

    await this.repository.updateLog(deliveryId, {
      status: mappedStatus,
      providerMsgId: providerMessageId || log.providerMsgId,
      responseCode: responseCode || 200,
      failureReason: failureReason || (status === "BOUNCED" ? "Email bounced by destination provider" : null),
      deliveredAt: mappedStatus === "DELIVERED" ? new Date() : log.deliveredAt,
    });

    Logger.info(
      { deliveryId, status: mappedStatus, providerMessageId },
      `[AutomationService] Updated delivery record '${deliveryId}' to status '${mappedStatus}' via n8n callback`
    );

    return { success: true, message: `Delivery record successfully updated to ${mappedStatus}` };
  }

  /**
   * Background Outbox Retry Engine.
   * Periodically checks for PENDING or RETRYING outbox logs whose backoff schedule has elapsed.
   */
  public startRetryWorker(intervalMs: number = 20000) {
    if (this.retryWorkerTimer) return;

    this.retryWorkerTimer = setInterval(async () => {
      if (this.isProcessingRetries) return;
      if (!config.n8n.enabled || !config.n8n.baseUrl) return;

      this.isProcessingRetries = true;
      try {
        const pendingItems = await this.repository.findPendingRetries(5);
        for (const item of pendingItems) {
          try {
            const envelope = item.payload as AutomationPayloadEnvelope;
            await this.executeDelivery(item.deliveryId, envelope);
          } catch (itemErr) {
            Logger.warn({ deliveryId: item.deliveryId, itemErr }, "[AutomationService] Retry execution exception");
          }
        }
      } catch (err) {
        Logger.warn({ err }, "[AutomationService] Outbox retry worker error");
      } finally {
        this.isProcessingRetries = false;
      }
    }, intervalMs);

    // Unref timer so it doesn't block graceful shutdown
    if (this.retryWorkerTimer && typeof this.retryWorkerTimer.unref === "function") {
      this.retryWorkerTimer.unref();
    }
  }

  /**
   * Stops the background outbox retry worker on shutdown.
   */
  public stopRetryWorker() {
    if (this.retryWorkerTimer) {
      clearInterval(this.retryWorkerTimer);
      this.retryWorkerTimer = null;
    }
  }

  /**
   * Returns system configuration and delivery telemetry.
   */
  public async getSystemStatus(): Promise<AutomationStatusResponse> {
    const stats = await this.repository.getDeliveryStats();

    return {
      enabled: config.n8n.enabled,
      baseUrl: config.n8n.baseUrl,
      callbackUrl: config.n8n.callbackUrl,
      configured: Boolean(config.n8n.baseUrl && config.n8n.baseUrl.trim().length > 0),
      webhookSecretConfigured: Boolean(config.n8n.webhookSecret && config.n8n.webhookSecret.trim().length > 0),
      adminNotificationEmail: config.n8n.adminNotificationEmail,
      timeoutMs: config.n8n.timeoutMs,
      deliveryStats: {
        total: stats.total,
        delivered: stats.delivered,
        accepted: stats.accepted,
        failed: stats.failed,
        pending: stats.pending,
        retrying: stats.retrying,
      },
      lastDeliveredAt: stats.lastDeliveredAt,
    };
  }

  /**
   * Returns paginated delivery logs for admin panel.
   */
  public async getLogs(filters: AutomationLogQueryFilters) {
    return await this.repository.findLogs(filters);
  }

  /**
   * Triggers a live test event from the admin console.
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
