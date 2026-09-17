import { Logger } from "../logger/index.js";

/**
 * Structured Security Log Event helper for recording security-critical lifecycle events.
 */
export class SecurityLogger {
  /**
   * Logs a successful authentication event.
   */
  public static logAuthSuccess(details: {
    userId: string;
    endpoint: string;
    action?: string;
    ipAddress?: string;
    userAgent?: string;
  }): void {
    Logger.info(
      {
        securityEvent: "AUTH_SUCCESS",
        userId: details.userId,
        endpoint: details.endpoint,
        action: details.action ?? "authentication",
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      },
      `SecurityEvent [AUTH_SUCCESS]: User '${details.userId}' authenticated successfully on ${details.endpoint}`
    );
  }

  /**
   * Logs an authentication failure event.
   */
  public static logAuthFailure(details: {
    reason: string;
    endpoint: string;
    action?: string;
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
  }): void {
    Logger.warn(
      {
        securityEvent: "AUTH_FAILURE",
        reason: details.reason,
        userId: details.userId,
        endpoint: details.endpoint,
        action: details.action ?? "authentication",
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      },
      `SecurityEvent [AUTH_FAILURE]: Authentication failed on ${details.endpoint} - ${details.reason}`
    );
  }

  /**
   * Logs an authorization / access denied event.
   */
  public static logAccessDenied(details: {
    userId: string;
    requiredRoleOrPermission: string;
    endpoint: string;
    ipAddress?: string;
  }): void {
    Logger.warn(
      {
        securityEvent: "ACCESS_DENIED",
        userId: details.userId,
        requiredRoleOrPermission: details.requiredRoleOrPermission,
        endpoint: details.endpoint,
        ipAddress: details.ipAddress,
      },
      `SecurityEvent [ACCESS_DENIED]: User '${details.userId}' denied access to ${details.endpoint}. Required: ${details.requiredRoleOrPermission}`
    );
  }

  /**
   * Logs a structured security or lifecycle audit event.
   */
  public static logSecurityEvent(details: {
    action: string;
    actorId?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): void {
    Logger.info(
      {
        securityEvent: details.action,
        actorId: details.actorId,
        targetId: details.targetId,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        ...details.metadata,
      },
      `SecurityEvent [${details.action}]: Target '${details.targetId ?? "N/A"}' by actor '${details.actorId ?? "system"}'`
    );
  }
}
