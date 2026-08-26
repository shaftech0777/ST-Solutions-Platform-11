import { AccountType } from "@prisma/client";

/**
 * Granular System Permission keys for ST-Solutions RBAC.
 */
export const PERMISSIONS = {
  // Users Management
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_SUSPEND: "users.suspend",
  USERS_RESET_PASSWORD: "users.reset_password",
  USERS_CHANGE_ROLE: "users.change_role",
  USERS_MANAGE_STATUS: "users.manage_status",
  USERS_MANAGE_ROLE: "users.manage_role",

  // Projects Management
  PROJECTS_READ: "projects.read",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_UPDATE: "projects.update",
  PROJECTS_DELETE: "projects.delete",
  PROJECTS_MANAGE_STATUS: "projects.manage_status",
  PROJECTS_MANAGE_OWNERSHIP: "projects.manage_ownership",
  PROJECTS_MANAGE_UPDATES: "projects.manage_updates",

  // Team & Members
  TEAM_READ: "team.read",
  TEAM_MANAGE: "team.manage",
  MEMBERS_READ: "members.read",
  MEMBERS_INVITE: "members.invite",
  MEMBERS_UPDATE: "members.update",
  MEMBERS_DELETE: "members.delete",
  MEMBERS_MANAGE_STATUS: "members.manage_status",
  MEMBERS_MANAGE_RANK: "members.manage_rank",
  MEMBERS_ONBOARD: "members.onboard",

  // Dashboards
  DASHBOARD_ADMIN: "dashboard.admin",
  DASHBOARD_SUBADMIN: "dashboard.subadmin",
  DASHBOARD_MANAGER: "dashboard.manager",
  DASHBOARD_MEMBER: "dashboard.member",

  // Settings & System
  SETTINGS_READ: "settings.read",
  SETTINGS_UPDATE: "settings.update",

  // Audit Logs
  AUDIT_READ: "audit.read",

  // Clients
  CLIENTS_READ: "clients.read",
  CLIENTS_CREATE: "clients.create",
  CLIENTS_UPDATE: "clients.update",
  CLIENTS_DELETE: "clients.delete",
  CLIENTS_MANAGE_STATUS: "clients.manage_status",
  CLIENTS_MANAGE_OWNERSHIP: "clients.manage_ownership",

  // Payments & Financials
  PAYMENTS_READ: "payments.read",
  PAYMENTS_CREATE: "payments.create",
  PAYMENTS_UPDATE: "payments.update",
  PAYMENTS_DELETE: "payments.delete",
  PAYMENTS_MANAGE_STATUS: "payments.manage_status",

  // Applicants & Recruitment
  APPLICANTS_READ: "applicants.read",
  APPLICANTS_CREATE: "applicants.create",
  APPLICANTS_UPDATE: "applicants.update",
  APPLICANTS_DELETE: "applicants.delete",
  APPLICANTS_REVIEW: "applicants.review",
  APPLICANTS_APPROVE: "applicants.approve",
  APPLICANTS_REJECT: "applicants.reject",
  VERIFICATION_REVIEW: "verification.review",

  // Roles & Permissions Management
  ROLES_READ: "roles.read",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  PERMISSIONS_READ: "permissions.read",
  PERMISSIONS_CREATE: "permissions.create",
  PERMISSIONS_UPDATE: "permissions.update",
  PERMISSIONS_DELETE: "permissions.delete",

  // Organizations & Workspaces
  ORGANIZATIONS_READ: "organizations.read",
  ORGANIZATIONS_UPDATE: "organizations.update",
  ORGANIZATIONS_MANAGE: "organizations.manage",
  WORKSPACES_READ: "workspaces.read",
  WORKSPACES_MANAGE: "workspaces.manage",

  // AI & Assistant
  AI_QUERY: "ai.query",

  // Profile
  PROFILE_READ: "profile.read",
  PROFILE_UPDATE: "profile.update",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Numerical weight for role hierarchy comparisons.
 * Higher weight = higher administrative privilege.
 */
export const ROLE_HIERARCHY_LEVEL: Record<string, number> = {
  OWNER: 4,
  SUPER_ADMIN: 4,
  ADMIN: 4,
  "ROLE-ADMIN": 4,
  ROLE_ADMIN: 4,
  SUB_ADMIN: 3,
  SUBADMIN: 3,
  "ROLE-SUBADMIN": 3,
  ROLE_SUBADMIN: 3,
  MANAGER: 2,
  "ROLE-MANAGER": 2,
  ROLE_MANAGER: 2,
  MEMBER: 1,
  "ROLE-MEMBER": 1,
  ROLE_MEMBER: 1,
  CLIENT: 0,
  "ROLE-CLIENT": 0,
  ROLE_CLIENT: 0,
};

/**
 * Standard Role-to-Permission mapping.
 */
export const ROLE_PERMISSIONS: Record<AccountType | string, readonly string[]> = {
  ADMIN: Object.values(PERMISSIONS),

  SUB_ADMIN: [
    PERMISSIONS.DASHBOARD_ADMIN,
    PERMISSIONS.DASHBOARD_SUBADMIN,
    PERMISSIONS.DASHBOARD_MANAGER,
    PERMISSIONS.DASHBOARD_MEMBER,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_RESET_PASSWORD,
    PERMISSIONS.USERS_CHANGE_ROLE,
    PERMISSIONS.USERS_MANAGE_STATUS,
    PERMISSIONS.USERS_MANAGE_ROLE,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.PROJECTS_MANAGE_STATUS,
    PERMISSIONS.PROJECTS_MANAGE_OWNERSHIP,
    PERMISSIONS.PROJECTS_MANAGE_UPDATES,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_UPDATE,
    PERMISSIONS.MEMBERS_DELETE,
    PERMISSIONS.MEMBERS_MANAGE_STATUS,
    PERMISSIONS.MEMBERS_MANAGE_RANK,
    PERMISSIONS.MEMBERS_ONBOARD,
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.CLIENTS_DELETE,
    PERMISSIONS.CLIENTS_MANAGE_STATUS,
    PERMISSIONS.CLIENTS_MANAGE_OWNERSHIP,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_UPDATE,
    PERMISSIONS.PAYMENTS_DELETE,
    PERMISSIONS.PAYMENTS_MANAGE_STATUS,
    PERMISSIONS.APPLICANTS_READ,
    PERMISSIONS.APPLICANTS_CREATE,
    PERMISSIONS.APPLICANTS_UPDATE,
    PERMISSIONS.APPLICANTS_DELETE,
    PERMISSIONS.APPLICANTS_REVIEW,
    PERMISSIONS.APPLICANTS_APPROVE,
    PERMISSIONS.APPLICANTS_REJECT,
    PERMISSIONS.VERIFICATION_REVIEW,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.PERMISSIONS_READ,
    PERMISSIONS.ORGANIZATIONS_READ,
    PERMISSIONS.ORGANIZATIONS_UPDATE,
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AI_QUERY,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],

  MANAGER: [
    PERMISSIONS.DASHBOARD_MANAGER,
    PERMISSIONS.DASHBOARD_MEMBER,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_UPDATE,
    PERMISSIONS.MEMBERS_MANAGE_STATUS,
    PERMISSIONS.MEMBERS_MANAGE_RANK,
    PERMISSIONS.MEMBERS_ONBOARD,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_MANAGE_STATUS,
    PERMISSIONS.PROJECTS_MANAGE_OWNERSHIP,
    PERMISSIONS.PROJECTS_MANAGE_UPDATES,
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.CLIENTS_MANAGE_STATUS,
    PERMISSIONS.CLIENTS_MANAGE_OWNERSHIP,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_UPDATE,
    PERMISSIONS.PAYMENTS_MANAGE_STATUS,
    PERMISSIONS.APPLICANTS_READ,
    PERMISSIONS.APPLICANTS_CREATE,
    PERMISSIONS.APPLICANTS_UPDATE,
    PERMISSIONS.APPLICANTS_REVIEW,
    PERMISSIONS.APPLICANTS_APPROVE,
    PERMISSIONS.APPLICANTS_REJECT,
    PERMISSIONS.VERIFICATION_REVIEW,
    PERMISSIONS.ORGANIZATIONS_READ,
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.AI_QUERY,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],

  MEMBER: [
    PERMISSIONS.DASHBOARD_MEMBER,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_MANAGE_UPDATES,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.AI_QUERY,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],

  CLIENT: [
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],
};

/**
 * Normalizes any role or account type string into a canonical key.
 */
export function normalizeRoleKey(roleOrAccountType?: string | null): string {
  if (!roleOrAccountType) return "";
  const cleaned = roleOrAccountType.toUpperCase().replace(/^ROLE[-_]/, "").replace(/[-]/g, "_");
  if (cleaned === "SUBADMIN") return "SUB_ADMIN";
  if (cleaned === "SUPERADMIN" || cleaned === "SUPER_ADMIN" || cleaned === "OWNER") return "ADMIN";
  return cleaned;
}

/**
 * Returns the authoritative list of permissions for a given role/accountType.
 */
export function getPermissionsForRole(roleOrAccountType?: string | null): string[] {
  if (!roleOrAccountType) return [];
  const key = normalizeRoleKey(roleOrAccountType);
  if (key === "ADMIN") return Object.values(PERMISSIONS);
  return (ROLE_PERMISSIONS[key] || []).slice();
}

/**
 * Evaluates whether an actor role has sufficient hierarchy level to manage a target user role.
 * - ADMIN can manage anyone (except cannot perform invalid self-actions or delete the last admin).
 * - SUB_ADMIN can manage MANAGER and MEMBER.
 * - MANAGER can only manage MEMBER.
 * - MEMBER cannot manage other accounts.
 */
export function canActorManageTargetRole(
  actorRole: string | AccountType | undefined,
  targetRole: string | AccountType | undefined
): boolean {
  if (!actorRole) return false;
  const actorKey = normalizeRoleKey(String(actorRole));
  const targetKey = targetRole ? normalizeRoleKey(String(targetRole)) : "";

  if (actorKey === "ADMIN") return true;

  const actorWeight = ROLE_HIERARCHY_LEVEL[actorKey] ?? 0;
  const targetWeight = targetKey ? (ROLE_HIERARCHY_LEVEL[targetKey] ?? 0) : 0;

  // Actor must have strictly higher hierarchy weight than the target user
  return actorWeight > targetWeight;
}

/**
 * Evaluates whether an actor role is authorized to assign or create a specific role.
 * - ADMIN can assign ADMIN, SUB_ADMIN, MANAGER, MEMBER.
 * - SUB_ADMIN can assign MANAGER, MEMBER.
 * - MANAGER can assign MEMBER.
 * - MEMBER cannot assign any role.
 */
export function canActorAssignRole(
  actorRole: string | AccountType | undefined,
  roleToAssign: string | AccountType | undefined
): boolean {
  if (!actorRole || !roleToAssign) return false;
  const actorKey = normalizeRoleKey(String(actorRole));
  const assignKey = normalizeRoleKey(String(roleToAssign));

  // ADMIN can create up to ADMIN level
  if (actorKey === "ADMIN") return true;

  const actorWeight = ROLE_HIERARCHY_LEVEL[actorKey] ?? 0;
  const assignWeight = ROLE_HIERARCHY_LEVEL[assignKey] ?? 0;

  // Others can only create/assign strictly lower roles
  return actorWeight > assignWeight;
}
