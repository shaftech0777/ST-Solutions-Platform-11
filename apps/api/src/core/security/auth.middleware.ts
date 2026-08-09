import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticationError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import { RequestContext } from "../context/request-context.js";
import { jwtService as defaultJwtService, JwtService } from "./jwt.service.js";
import { SecurityLogger } from "./security.logger.js";
import { AuthenticatedRequest, AuthUser } from "./security.types.js";

/**
 * Express middleware requiring a valid JWT Bearer access token in the Authorization header.
 * On success, decorates `req.user` and updates request-scoped `RequestContext`.
 *
 * @param jwtServiceInstance Optional custom JwtService instance (defaults to singleton)
 * @returns Express RequestHandler
 */
export function authenticate(jwtServiceInstance: JwtService = defaultJwtService): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const authHeader = req.headers.authorization;
    const endpoint = `${req.method} ${req.originalUrl || req.url}`;
    const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string) || undefined;
    const userAgent = req.headers["user-agent"];

    try {
      if (!authHeader) {
        throw new AuthenticationError(
          "Authorization header with Bearer token is required",
          ERROR_CODES.AUTH_MISSING_HEADER
        );
      }

      if (!authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError(
          "Invalid authorization header format. Format must be 'Bearer <token>'",
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      const token = authHeader.substring(7).trim();

      if (token.length === 0) {
        throw new AuthenticationError("Bearer token payload is empty", ERROR_CODES.AUTH_MISSING_HEADER);
      }

      // Verify JWT access token
      const payload = jwtServiceInstance.verifyAccessToken(token);

      const authUser: AuthUser = {
        userId: payload.sub,
        sessionId: payload.sessionId,
        email: payload.email,
        accountType: payload.accountType,
        role: payload.role,
        permissions: payload.permissions ?? [],
      };

      // Decorate Request
      authReq.user = authUser;
      authReq.token = token;

      // Update AsyncLocalStorage Request Context
      RequestContext.setUserId(authUser.userId);
      if (authUser.sessionId) {
        RequestContext.setSessionId(authUser.sessionId);
      }
      if (authUser.accountType) {
        RequestContext.setMetadata("accountType", authUser.accountType);
      }
      if (authUser.permissions) {
        RequestContext.setMetadata("permissions", authUser.permissions);
      }

      SecurityLogger.logAuthSuccess({
        userId: authUser.userId,
        endpoint,
        ipAddress,
        userAgent,
      });

      return next();
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Authentication failed";
      SecurityLogger.logAuthFailure({
        reason,
        endpoint,
        ipAddress,
        userAgent,
      });

      return next(error);
    }
  };
}

/**
 * Optional authentication middleware.
 * Inspects Authorization header if present, populating `req.user` if valid, but does not block unauthenticated requests.
 */
export function optionalAuthenticate(jwtServiceInstance: JwtService = defaultJwtService): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7).trim();
    if (token.length === 0) {
      return next();
    }

    try {
      const payload = jwtServiceInstance.verifyAccessToken(token);

      const authUser: AuthUser = {
        userId: payload.sub,
        sessionId: payload.sessionId,
        email: payload.email,
        accountType: payload.accountType,
        role: payload.role,
        permissions: payload.permissions ?? [],
      };

      authReq.user = authUser;
      authReq.token = token;

      RequestContext.setUserId(authUser.userId);
      if (authUser.sessionId) {
        RequestContext.setSessionId(authUser.sessionId);
      }
    } catch {
      // Ignore token invalidity for optional authentication
    }

    return next();
  };
}
