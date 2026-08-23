import { useAuth } from "../context/AuthContext.js";

export function usePermission() {
  const { currentUser, permissions, currentOrganization, currentWorkspace } = useAuth();

  const accountType = (currentUser?.accountType || "").toUpperCase();
  const roleName = (currentUser?.role?.name || "").toUpperCase();

  const isAdmin = accountType === "ADMIN" || roleName === "ADMIN" || roleName === "SUPER_ADMIN" || roleName === "OWNER";
  const isSubAdmin = accountType === "SUB_ADMIN" || roleName === "SUB_ADMIN" || roleName === "CO_ADMIN";
  const isManager = accountType === "MANAGER" || roleName === "MANAGER" || roleName === "LEAD";
  const isMember = !isAdmin && !isSubAdmin && !isManager;

  const hasPermission = (requiredPermission: string): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true; // Super admin override
    if (permissions.includes("*") || permissions.includes("all")) return true;
    return permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (permissions.includes("*") || permissions.includes("all")) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (permissions.includes("*") || permissions.includes("all")) return true;
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };

  const hasRole = (targetRole: string): boolean => {
    if (!currentUser) return false;
    const target = targetRole.toUpperCase();
    return accountType === target || roleName === target;
  };

  const isOrgOwnerOrAdmin = (): boolean => {
    if (!currentOrganization) return false;
    if (isAdmin) return true;
    const orgRole = (currentOrganization.role || "").toUpperCase();
    return orgRole === "OWNER" || orgRole === "ADMIN";
  };

  const isWorkspaceAdmin = (): boolean => {
    if (!currentWorkspace) return false;
    if (isAdmin || isOrgOwnerOrAdmin()) return true;
    const wsRole = (currentWorkspace.role || "").toUpperCase();
    return wsRole === "ADMIN" || wsRole === "OWNER" || wsRole === "LEAD";
  };

  /**
   * Evaluates navigation module access based on current role and RBAC permissions
   */
  const canAccess = (moduleName: string): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;

    switch (moduleName.toLowerCase()) {
      case "dashboard":
      case "overview":
      case "ai":
        return true;
      case "organizations":
        return isAdmin || isSubAdmin || hasPermission("org:read") || hasPermission("org:manage");
      case "workspaces":
        return isAdmin || isSubAdmin || isOrgOwnerOrAdmin() || hasPermission("workspace:read");
      case "clients":
        return isAdmin || isSubAdmin || isManager || hasPermission("client:read");
      case "projects":
        return true; // All authenticated members can view project board
      case "payments":
        return isAdmin || isSubAdmin || isManager || hasPermission("payment:read") || hasPermission("finance:read");
      case "applicants":
      case "talent":
        return isAdmin || isSubAdmin || isManager || hasPermission("talent:read") || hasPermission("applicant:read");
      case "members":
        return isAdmin || isSubAdmin || isOrgOwnerOrAdmin() || hasPermission("member:read") || hasPermission("user:read");
      case "roles":
      case "permissions":
        return isAdmin || (isSubAdmin && hasPermission("role:read"));
      case "audit":
      case "auditlogs":
        return isAdmin || isSubAdmin || hasPermission("audit:read");
      case "notifications":
        return true;
      case "settings":
        return true; // Account settings accessible by all, sub-sections guarded
      default:
        return true;
    }
  };

  /**
   * Action-level permission check
   */
  const can = (action: "create" | "read" | "update" | "delete" | "manage", resource: string): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    const permString = `${resource}:${action}`;
    const manageString = `${resource}:manage`;
    return permissions.includes(permString) || permissions.includes(manageString) || permissions.includes("*");
  };

  return {
    currentUser,
    permissions,
    isAdmin,
    isSubAdmin,
    isManager,
    isMember,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isOrgOwnerOrAdmin,
    isWorkspaceAdmin,
    canAccess,
    can,
  };
}

