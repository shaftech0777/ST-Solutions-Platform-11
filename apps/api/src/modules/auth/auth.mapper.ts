import { SafeUser } from "./auth.types.js";

/**
 * Maps a Prisma User record (including optional role, permissions, profile relations)
 * to a sanitized `SafeUser` object, excluding sensitive fields such as passwordHash.
 */
export function sanitizeUser(user: {
  id: string;
  email: string | null;
  accountType: any;
  status: any;
  roleId: string | null;
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
}): SafeUser {
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
