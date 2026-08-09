import { AppError, normalizeError } from "../core/errors/index.js";
import { Logger } from "../core/logger/index.js";

/**
 * Maps raw database/Prisma errors into normalized AppError domain instances.
 * Strips raw SQL statements, connection URLs, and sensitive database internals.
 *
 * @param error Raw caught exception
 * @param requestId Optional request correlation ID
 * @returns Strongly typed AppError instance
 */
export function handleDatabaseError(error: unknown, requestId?: string): AppError {
  const normalized = normalizeError(error, requestId);

  // Log normalized database error securely
  Logger.error(
    {
      errorName: normalized.name,
      errorCode: normalized.errorCode,
      statusCode: normalized.statusCode,
      requestId: normalized.requestId,
    },
    `Database Operation Exception: ${normalized.message}`
  );

  return normalized;
}
