import { NextFunction, Request, RequestHandler, Response } from "express";
import { OrganizationRole, WorkspaceRole } from "@prisma/client";
import { AuthenticationError, AuthorizationError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import { SecurityLogger } from "./security.logger.js";
import { AuthenticatedRequest, TenantContextData } from "./security.types.js";
import { TenantContext } from "./tenant.context.js";
import { organizationRepository } from "../../modules/organizations/organization.repository.js";
import { workspaceRepository } from "../../modules/workspaces/workspace.repository.js";
import { formatEndpoint } from "./rbac.middleware.js";

interface TenantMiddlewareOptions {
  paramName?: string;
  headerName?: string;
  queryName?: string;
  allowDefaultFallback?: boolean;
}

/**
 * Middleware enforcing active Organization membership.
 * Extracts organizationId from params, header (x-organization-id), query, or default fallback.
 * Verifies membership in DB, populates TenantContext and req.tenantContext.
 */
export function requireOrganizationMembership(options?: TenantMiddlewareOptions): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access tenant resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    const paramName = options?.paramName || "organizationId";
    const headerName = options?.headerName || "x-organization-id";
    const queryName = options?.queryName || "organizationId";

    let organizationId: string | undefined =
      req.params?.[paramName] ||
      req.params?.id ||
      (req.headers?.[headerName] as string) ||
      (req.query?.[queryName] as string);

    // Fallback if no org ID provided
    if (!organizationId && (options?.allowDefaultFallback ?? true)) {
      const userOrgs = await organizationRepository.findUserOrganizations(user.userId);
      if (userOrgs.length > 0) {
        organizationId = userOrgs[0].id;
      }
    }

    if (!organizationId) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: "OrganizationMembership (Missing organizationId)",
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          "Organization context is required. Please specify organizationId or 'x-organization-id' header",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    // Platform ADMIN override bypasses membership check, but populates context
    if (user.accountType === "ADMIN") {
      const tenantData: TenantContextData = {
        organizationId,
        organizationRole: OrganizationRole.OWNER,
      };
      authReq.tenantContext = tenantData;
      TenantContext.setTenantContext(tenantData);
      return next();
    }

    const member = await organizationRepository.getMember(organizationId, user.userId);
    if (!member) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `OrganizationMember for ${organizationId}`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          "Access denied: You are not a member of this organization",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    const tenantData: TenantContextData = {
      organizationId,
      organizationRole: member.role,
    };
    authReq.tenantContext = tenantData;
    TenantContext.setTenantContext(tenantData);

    return next();
  };
}

/**
 * Middleware enforcing Workspace membership.
 * Verifies caller belongs to workspace's parent organization AND workspace (or is Org OWNER/ADMIN).
 */
export function requireWorkspaceMembership(options?: TenantMiddlewareOptions): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(
        new AuthenticationError("Authentication required to access workspace resource", ERROR_CODES.AUTH_UNAUTHORIZED)
      );
    }

    const paramName = options?.paramName || "workspaceId";
    const headerName = options?.headerName || "x-workspace-id";
    const queryName = options?.queryName || "workspaceId";

    const workspaceId: string | undefined =
      req.params?.[paramName] ||
      req.params?.id ||
      (req.headers?.[headerName] as string) ||
      (req.query?.[queryName] as string);

    if (!workspaceId) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: "WorkspaceMembership (Missing workspaceId)",
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          "Workspace context is required. Please specify workspaceId or 'x-workspace-id' header",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return next(
        new AuthorizationError(
          "Workspace not found or access denied",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    // Platform ADMIN override
    if (user.accountType === "ADMIN") {
      const tenantData: TenantContextData = {
        organizationId: workspace.organizationId,
        organizationRole: OrganizationRole.OWNER,
        workspaceId: workspace.id,
        workspaceRole: WorkspaceRole.ADMIN,
      };
      authReq.tenantContext = tenantData;
      TenantContext.setTenantContext(tenantData);
      return next();
    }

    // Check organization membership
    const orgMember = await organizationRepository.getMember(workspace.organizationId, user.userId);
    if (!orgMember) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `OrganizationMember for workspace org ${workspace.organizationId}`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          "Access denied: You do not belong to the organization owning this workspace",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    // Check workspace membership or org OWNER/ADMIN
    const wsMember = workspace.members.find((m) => m.userId === user.userId);
    const isOrgAdminOrOwner =
      orgMember.role === OrganizationRole.OWNER || orgMember.role === OrganizationRole.ADMIN;

    if (!wsMember && !isOrgAdminOrOwner) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `WorkspaceMember for ${workspaceId}`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          "Access denied: You are not a member of this workspace",
          ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
        )
      );
    }

    const tenantData: TenantContextData = {
      organizationId: workspace.organizationId,
      organizationRole: orgMember.role,
      workspaceId: workspace.id,
      workspaceRole: wsMember ? wsMember.role : isOrgAdminOrOwner ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER,
    };
    authReq.tenantContext = tenantData;
    TenantContext.setTenantContext(tenantData);

    return next();
  };
}

/**
 * Middleware restricting access based on OrganizationRole (e.g., OWNER, ADMIN, MEMBER, GUEST).
 */
export function requireOrganizationRole(...allowedRoles: OrganizationRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(new AuthenticationError("Authentication required", ERROR_CODES.AUTH_UNAUTHORIZED));
    }

    if (user.accountType === "ADMIN") {
      return next();
    }

    const currentRole = authReq.tenantContext?.organizationRole as OrganizationRole | undefined;

    if (!currentRole || !allowedRoles.includes(currentRole)) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `OrganizationRoles: [${allowedRoles.join(", ")}]`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          `Access denied. Required organization role in [${allowedRoles.join(", ")}] not possessed`,
          ERROR_CODES.FORBIDDEN_ROLE_REQUIRED
        )
      );
    }

    return next();
  };
}

/**
 * Middleware restricting access based on WorkspaceRole (e.g., ADMIN, MEMBER, VIEWER).
 */
export function requireWorkspaceRole(...allowedRoles: WorkspaceRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const endpoint = formatEndpoint(req);

    if (!user) {
      return next(new AuthenticationError("Authentication required", ERROR_CODES.AUTH_UNAUTHORIZED));
    }

    if (user.accountType === "ADMIN") {
      return next();
    }

    const orgRole = authReq.tenantContext?.organizationRole as OrganizationRole | undefined;
    if (orgRole === OrganizationRole.OWNER || orgRole === OrganizationRole.ADMIN) {
      return next();
    }

    const wsRole = authReq.tenantContext?.workspaceRole as WorkspaceRole | undefined;

    if (!wsRole || !allowedRoles.includes(wsRole)) {
      SecurityLogger.logAccessDenied({
        userId: user.userId,
        requiredRoleOrPermission: `WorkspaceRoles: [${allowedRoles.join(", ")}]`,
        endpoint,
        ipAddress: req.ip,
      });

      return next(
        new AuthorizationError(
          `Access denied. Required workspace role in [${allowedRoles.join(", ")}] not possessed`,
          ERROR_CODES.FORBIDDEN_ROLE_REQUIRED
        )
      );
    }

    return next();
  };
}
