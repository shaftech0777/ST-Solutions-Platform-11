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
  createdAt: Date;
  updatedAt: Date;
}): UserResponse {
  const permissions: string[] = user.role?.permissions
    ? user.role.permissions.map((rp) => rp.permission.name)
    : [];

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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
