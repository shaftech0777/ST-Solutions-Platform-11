import { NextFunction, Request, Response } from "express";
import { generateRequestId } from "../core/context/request-id.js";
import { RequestContext } from "../core/context/request-context.js";

/**
 * Express Request Context Middleware.
 * Extracts or generates X-Request-ID, attaches it to the response header,
 * and initializes a Node.js AsyncLocalStorage context for request-scoped tracing.
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerRequestId = req.headers["x-request-id"];
  const requestId = typeof headerRequestId === "string" && headerRequestId.trim() !== ""
    ? headerRequestId.trim()
    : generateRequestId();

  // Attach requestId to Express request and response header
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  const ipAddress = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.ip;
  const userAgent = req.headers["user-agent"];

  RequestContext.run(
    {
      requestId,
      ipAddress,
      userAgent,
    },
    () => {
      next();
    }
  );
}
