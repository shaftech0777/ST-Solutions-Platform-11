import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../core/errors/app-error.js";
import { ERROR_CODES } from "../core/errors/error.codes.js";

/**
 * Interface extending Express Request to read attached correlation ID.
 */
interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Express 404 Route Not Found Middleware.
 * Intercepts requests to unmapped routes and passes a typed NotFoundError to the next error middleware.
 */
export function notFoundHandlerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const reqWithId = req as RequestWithId;
  const requestId = reqWithId.requestId ?? (req.headers["x-request-id"] as string | undefined);
  const route = `${req.method} ${req.originalUrl || req.url}`;

  const error = new NotFoundError(
    `Route '${route}' was not found on this server`,
    ERROR_CODES.SYSTEM_NOT_FOUND,
    requestId
  );

  next(error);
}
