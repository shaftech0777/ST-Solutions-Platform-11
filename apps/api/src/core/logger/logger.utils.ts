import { RequestContext } from "../context/request-context.js";
import { LoggerContext } from "./logger.types.js";

/**
 * Extracts active request context parameters to inject into structured log payloads.
 *
 * @returns Structured object containing current correlation metadata
 */
export function getLogContext(): LoggerContext {
  const context = RequestContext.get();
  if (!context) {
    return {};
  }

  const logContext: LoggerContext = {
    requestId: context.requestId,
    ...(context.userId !== undefined && { userId: context.userId }),
    ...(context.sessionId !== undefined && { sessionId: context.sessionId }),
    ...(context.ipAddress !== undefined && { ipAddress: context.ipAddress }),
  };

  return logContext;
}

/**
 * Recursively sanitizes raw input objects to sanitize sensitive keys if passed outside Pino redaction.
 *
 * @param data Object or data to sanitize
 * @returns Cleaned data copy
 */
export function sanitizeLogData(data: unknown): unknown {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  const sensitiveKeys = new Set([
    "password",
    "passwordhash",
    "token",
    "accesstoken",
    "refreshtoken",
    "secret",
    "apikey",
    "authorization",
    "cookie",
  ]);

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
