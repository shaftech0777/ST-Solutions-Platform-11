import { AuditLogResponse } from "./audit.types.js";

/**
 * Redacts sensitive keywords/secrets from audit description strings.
 */
export function sanitizeAuditDescription(description: string | null | undefined): string | null {
  if (!description) return null;

  let cleaned = description;

  // Redact authorization tokens, bearer tokens, passwords, secrets
  cleaned = cleaned.replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, "$1[REDACTED]");
  cleaned = cleaned.replace(/(password|passwd|pwd|secret|token|apiKey|api_key|hash)\s*[:=]\s*["']?[^"'\s,}]*["']?/gi, "$1: [REDACTED]");

  return cleaned;
}

/**
 * Maps raw Prisma AuditLog record to clean response DTO.
 */
export function sanitizeAuditLogResponse(log: any): AuditLogResponse {
  return {
    id: log.id,
    userId: log.userId || null,
    action: log.action,
    description: sanitizeAuditDescription(log.description),
    ipAddress: log.ipAddress || null,
    createdAt: log.createdAt,
    user: log.user
      ? {
          id: log.user.id,
          fullName: log.user.profile?.fullName || log.user.email || "System User",
          email: log.user.email || null,
        }
      : null,
  };
}
