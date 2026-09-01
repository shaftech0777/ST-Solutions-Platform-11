import { UserResponse } from "./users.types.js";

/**
 * Transforms database User record with populated relations into a sanitized UserResponse payload.
 * Strictly strips sensitive attributes such as passwordHash.
 */
export function sanitizeUserResponse(user: {
  id: string;
  email: string | null;
  accountType: any;
  status: any;
  roleId: string | null;
  createdByUserId?: string | null;
  managedByUserId?: string | null;
  organizationId?: string | null;
  workspaceId?: string | null;
  suspensionReason?: string | null;
  suspendedAt?: Date | null;
  role?: {
    name: string;
    permissions?: {
      permission: {
        name: string;
      };
    }[];
  } | null;
  profile?: {
    fullName: string | null;
    profileImage: string | null;
    phoneNumber: string | null;
    country: string | null;
    city: string | null;
    address: string | null;
  } | null;
  createdByUser?: any;
  managedByUser?: any;
  managedUsers?: any[];
  memberAccount?: any;
  ownedClients?: any[];
  supervisedClients?: any[];
  assignedProjects?: any[];
  performance?: any;
  sessions?: any[];
  createdAt: Date;
  updatedAt: Date;
}): UserResponse {
  const permissions: string[] = user.role?.permissions
    ? user.role.permissions.map((rp) => rp.permission.name)
    : [];

  const supervisorUser = user.managedByUser || user.createdByUser;
  const supervisor = supervisorUser
    ? {
        id: supervisorUser.id,
        fullName: supervisorUser.profile?.fullName || null,
        email: supervisorUser.email || null,
        role: supervisorUser.role?.name || supervisorUser.accountType || "SUPERVISOR",
      }
    : null;

  const managedUsers = user.managedUsers?.map((u: any) => ({
    id: u.id,
    fullName: u.profile?.fullName || null,
    email: u.email || null,
    role: u.role?.name || u.accountType || "MEMBER",
    status: u.status,
  })) || [];

  const memberAccount = user.memberAccount
    ? {
        id: user.memberAccount.id,
        rankName: user.memberAccount.rank?.name || null,
        status: user.memberAccount.status,
        managerName: user.memberAccount.manager?.user?.profile?.fullName || null,
      }
    : null;

  const directOwnedClients = user.ownedClients || [];
  const memberOwnedClients = user.memberAccount?.ownedClients?.map((oc: any) => oc.client) || [];
  const allClients = [...directOwnedClients, ...memberOwnedClients.filter((c: any) => !directOwnedClients.some((dc: any) => dc.id === c.id))];

  const assignedClientsCount = allClients.length;
  const activeProjectsCount = user.assignedProjects?.length || 0;

  const lastSession = user.sessions && user.sessions.length > 0 ? user.sessions[0] : null;

  return {
    id: user.id,
    email: user.email,
    accountType: user.accountType,
    status: user.status,
    roleId: user.roleId,
    roleName: user.role?.name,
    permissions,
    createdByUserId: user.createdByUserId ?? null,
    managedByUserId: user.managedByUserId ?? null,
    organizationId: user.organizationId ?? null,
    workspaceId: user.workspaceId ?? null,
    suspensionReason: user.suspensionReason ?? null,
    suspendedAt: user.suspendedAt ?? null,
    profile: user.profile
      ? {
          fullName: user.profile.fullName,
          profileImage: user.profile.profileImage,
          phoneNumber: user.profile.phoneNumber,
          country: user.profile.country,
          city: user.profile.city,
          address: user.profile.address,
        }
      : null,
    hierarchy: {
      supervisor,
      managedUsersCount: managedUsers.length,
      managedUsers,
      memberAccount,
    },
    work: {
      assignedClientsCount,
      activeProjectsCount,
      performanceScore: user.performance?.satisfactionScore ?? 100,
      clients: allClients.slice(0, 10).map((c: any) => ({
        id: c.id,
        fullName: c.fullName,
        companyName: c.companyName,
        clientStatus: c.clientStatus,
      })),
    },
    security: {
      status: user.status,
      suspensionReason: user.suspensionReason ?? null,
      suspendedAt: user.suspendedAt ?? null,
      lastLogin: lastSession?.createdAt || null,
      activeSessionsCount: user.sessions?.filter((s: any) => !s.revokedAt).length || 0,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
