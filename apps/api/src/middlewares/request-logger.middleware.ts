import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../core/context/request-context.js";
import { Logger } from "../core/logger/logger.js";

/**
 * Express Middleware for structured HTTP request logging.
 * Logs incoming requests and tracks request completion with execution timing and status code.
 */
export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const path = req.originalUrl || req.url;
  const method = req.method;
  const requestId = req.requestId || (req.headers["x-request-id"] as string | undefined);

  // Log incoming request start
  Logger.info({
    event: "HTTP_REQUEST_STARTED",
    method,
    path,
    requestId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  }, `HTTP ${method} ${path} - Started`);

  // Intercept response finish event to record duration and status code
  res.on("finish", () => {
    const durationMs = RequestContext.getElapsedTime() || Date.now() - startTime;
    const statusCode = res.statusCode;

    const logData = {
      event: "HTTP_REQUEST_COMPLETED",
      method,
      path,
      statusCode,
      durationMs,
      requestId,
    };

    const message = `HTTP ${method} ${path} ${statusCode} - ${durationMs}ms`;

    if (statusCode >= 500) {
      Logger.error(logData, message);
    } else if (statusCode >= 400) {
      Logger.warn(logData, message);
    } else {
      Logger.info(logData, message);
    }
  });

  next();
}
