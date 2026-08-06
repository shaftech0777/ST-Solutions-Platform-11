import { NextFunction, Request, Response } from "express";
import { normalizeError, sanitizeError } from "../core/errors/error.utils.js";
import { Logger } from "../core/logger/logger.js";
import { createErrorResponse } from "../core/responses/api-error-response.js";

/**
 * Interface extending Express Request to read attached correlation ID.
 */
interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Global Express Error Handling Middleware.
 * Catches all errors, normalizes them into typed AppError instances,
 * logs execution context using structured Pino Logger, and returns standardized JSON error responses.
 */
export function globalErrorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqWithId = req as RequestWithId;
  const requestId = reqWithId.requestId ?? (req.headers["x-request-id"] as string | undefined);

  // Normalize caught exception to typed AppError
  const appError = normalizeError(err, requestId);

  // Structured Log Context
  const logContext = {
    ...sanitizeError(appError),
    path: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip,
  };

  // Log non-operational or internal server errors via Pino Logger
  if (!appError.isOperational || appError.statusCode >= 500) {
    Logger.error(logContext, `Unhandled Exception: ${appError.message}`);
  } else {
    Logger.warn(logContext, `Operational Error: ${appError.message}`);
  }

  // Format error response
  const errorPayload = createErrorResponse({
    statusCode: appError.statusCode,
    error: appError.name,
    message: appError.message,
    details: appError.details,
    requestId: appError.requestId,
  });

  res.status(errorPayload.statusCode).json(errorPayload);
}
