import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticationError, AuthorizationError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import { getPermissionsForRole, normalizeRoleKey } from "./permissions.js";
import { SecurityLogger } from "./security.logger.js";
import { AuthenticatedRequest } from "./security.types.js";

export function formatEndpoint(req: Request): string {
  const method = req.method || "UNKNOWN";
  const path = req.originalUrl || req.url || req.path || "UNKNOWN_PATH";
  return `${method} ${path}`;
}

function normalizePerm(perm: string): string {
  return perm.trim().toLowerCase().replace(/[:/]/g, ".");
}

function hasPermissionMatch(userPermissions: Set<string>, requiredPerm: string): boolean {
  const normRequired = normalizePerm(requiredPerm);

  if (userPermissions.has("*") || userPermissions.has("all")) {
    return true;
  }

  if (userPermissions.has(normRequired)) {
    return true;
  }

  // Check domain wildcard (e.g. "users.*" matches "users.read")
  const [domain] = normRequired.split(".");
  if (domain && (userPermissions.has(`${domain}.*`) || userPermissions.has(`${domain}.all`))) {
    return true;
  }

  // Check management fallback (e.g. having "projects.update" satisfies "projects.manage_status")
  if (normRequired.endsWith(".manage_status") || normRequired.endsWith(".manage_ownership") || normRequired.endsWith(".manage_updates")) {
    if (userPermissions.has(`${domain}.update`) || userPermissions.has(`${domain}.manage`)) {
      return true;
    }
  }

  return false;
}

/**
 * Middleware restricting route access to users with specified account types (e.g. ADMIN, SUB_ADMIN, MANAGER, MEMBER, CLIENT).
 * ADMIN account type automatically bypasses restrictions.
 */
export function requireAccountType(...allowedAccountTypes: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access this resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    const normAccountType = normalizeRoleKey(user.accountType);
    const normRole = normalizeRoleKey(user.role);

    // ADMIN override
    if (normAccountType === "ADMIN" || normRole === "ADMIN") {
      return next();
    }

    const normAllowed = allowedAccountTypes.map((t) => normalizeRoleKey(t));
    const isAllowed = normAllowed.includes(normAccountType) || normAllowed.includes(normRole);

    if (!isAllowed) {
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
 */
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access this resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    const normAccountType = normalizeRoleKey(user.accountType);
    const normRole = normalizeRoleKey(user.role);

    // ADMIN override
    if (normAccountType === "ADMIN" || normRole === "ADMIN") {
      return next();
    }

    const normAllowed = allowedRoles.map((r) => normalizeRoleKey(r));
    const hasRole = normAllowed.includes(normRole) || normAllowed.includes(normAccountType);

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
 */
export function requirePermission(...requiredPermissions: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access this resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    const normAccountType = normalizeRoleKey(user.accountType);
    const normRole = normalizeRoleKey(user.role);

    // ADMIN override
    if (normAccountType === "ADMIN" || normRole === "ADMIN") {
      return next();
    }

    const rawPermissions = [
      ...(user.permissions ?? []),
      ...getPermissionsForRole(user.accountType),
      ...getPermissionsForRole(user.role),
    ];

    const normalizedUserPermissions = new Set<string>();
    for (const p of rawPermissions) {
      if (typeof p === "string") {
        normalizedUserPermissions.add(normalizePerm(p));
      } else if (p && typeof p === "object" && "name" in p) {
        normalizedUserPermissions.add(normalizePerm((p as any).name));
      }
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      hasPermissionMatch(normalizedUserPermissions, perm)
    );

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

