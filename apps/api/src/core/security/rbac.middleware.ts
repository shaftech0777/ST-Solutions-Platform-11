import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticationError, AuthorizationError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import { SecurityLogger } from "./security.logger.js";
import { AuthenticatedRequest } from "./security.types.js";

/**
 * Middleware restricting route access to users with specified account types (e.g. ADMIN, MANAGER, MEMBER, CLIENT).
 * ADMIN account type automatically bypasses restrictions.
 *
 * @param allowedAccountTypes List of allowed AccountType strings
 * @returns Express RequestHandler
 */
export function requireAccountType(...allowedAccountTypes: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = `${req.method} ${req.originalUrl || req.url}`;

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access this resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    // ADMIN override
    if (user.accountType === "ADMIN") {
      return next();
    }

    if (!user.accountType || !allowedAccountTypes.includes(user.accountType)) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `AccountTypes: [${allowedAccountTypes.join(", ")}]`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          `Access denied. Account type '${user.accountType ?? "NONE"}' is not authorized`,
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    return next();
  };
}

/**
 * Middleware restricting route access to users possessing specific custom roles.
 * ADMIN account type automatically bypasses restrictions.
 *
 * @param allowedRoles List of allowed role names or identifiers
 * @returns Express RequestHandler
 */
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = `${req.method} ${req.originalUrl || req.url}`;

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access this resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    // ADMIN override
    if (user.accountType === "ADMIN") {
      return next();
    }

    const hasRole =
      (user.role !== undefined && allowedRoles.includes(user.role)) ||
      (user.accountType !== undefined && allowedRoles.includes(user.accountType));

    if (!hasRole) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `Roles: [${allowedRoles.join(", ")}]`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          `Access denied. Required role in [${allowedRoles.join(", ")}] not found`,
          ERROR_CODES.FORBIDDEN_ROLE_REQUIRED
        )
      );
    }

    return next();
  };
}

/**
 * Middleware restricting route access to users with specified required permissions.
 * ADMIN account type automatically bypasses restrictions.
 *
 * @param requiredPermissions List of granular permission string names required
 * @returns Express RequestHandler
 */
export function requirePermission(...requiredPermissions: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = `${req.method} ${req.originalUrl || req.url}`;

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access this resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    // ADMIN override
    if (user.accountType === "ADMIN") {
      return next();
    }

    const userPermissions = user.permissions ?? [];
    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasAllPermissions) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `Permissions: [${requiredPermissions.join(", ")}]`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          "Access denied. Insufficient permissions to execute this request",
          ERROR_CODES.FORBIDDEN_INSUFFICIENT_PRIVILEGES
        )
      );
    }

    return next();
  };
}
