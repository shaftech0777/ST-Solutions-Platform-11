import { OrganizationRole, WorkspaceRole } from "@prisma/client";
import { RequestContext } from "../context/request-context.js";
import { TenantContextData } from "./security.types.js";

/**
 * TenantContext provides static access to current tenant scope (Organization and Workspace boundaries).
 */
export class TenantContext {
  /**
   * Retrieves active organizationId from RequestContext.
   */
  public static getOrganizationId(): string | undefined {
    return RequestContext.getOrganizationId();
  }

  /**
   * Retrieves active workspaceId from RequestContext.
   */
  public static getWorkspaceId(): string | undefined {
    return RequestContext.getWorkspaceId();
  }

  /**
   * Retrieves active organizationRole from RequestContext.
   */
  public static getOrganizationRole(): OrganizationRole | undefined {
    return RequestContext.getOrganizationRole() as OrganizationRole | undefined;
  }

  /**
   * Retrieves active workspaceRole from RequestContext.
   */
  public static getWorkspaceRole(): WorkspaceRole | undefined {
    return RequestContext.getWorkspaceRole() as WorkspaceRole | undefined;
  }

  /**
   * Sets tenant context scope in RequestContext.
   */
  public static setTenantContext(scope: TenantContextData): void {
    RequestContext.setTenantContext(scope);
  }

  /**
   * Gets full active tenant context scope object.
   */
  public static getScope(): TenantContextData {
    return {
      organizationId: TenantContext.getOrganizationId(),
      workspaceId: TenantContext.getWorkspaceId(),
      organizationRole: TenantContext.getOrganizationRole(),
      workspaceRole: TenantContext.getWorkspaceRole(),
    };
  }
}
