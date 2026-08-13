import { useAuth } from "../context/AuthContext.js";

export function usePermission() {
  const { currentUser, permissions, currentOrganization, currentWorkspace } = useAuth();

  const hasPermission = (requiredPermission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.accountType === "ADMIN") return true; // Super admin override
    return permissions.includes(requiredPermission) || permissions.includes("*");
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.accountType === "ADMIN") return true;
    return requiredPermissions.some((perm) => permissions.includes(perm) || permissions.includes("*"));
  };

  const hasRole = (roleName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.accountType === roleName) return true;
    return currentUser.role?.name.toUpperCase() === roleName.toUpperCase();
  };

  const isOrgOwnerOrAdmin = (): boolean => {
    if (!currentOrganization) return false;
    return currentOrganization.role === "OWNER" || currentOrganization.role === "ADMIN" || currentUser?.accountType === "ADMIN";
  };

  const isWorkspaceAdmin = (): boolean => {
    if (!currentWorkspace) return false;
    return currentWorkspace.role === "ADMIN" || isOrgOwnerOrAdmin();
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasRole,
    isOrgOwnerOrAdmin,
    isWorkspaceAdmin,
  };
}
