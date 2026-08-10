import { PermissionSummary, RoleResponse } from "./roles.types.js";

/**
 * Transforms database Role entity into a standardized RoleResponse payload.
 */
export function sanitizeRoleResponse(role: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: {
    permission: {
      id: string;
      name: string;
      description: string | null;
      createdAt?: Date;
    };
  }[];
  _count?: {
    users?: number;
  };
}): RoleResponse {
  const permissions: PermissionSummary[] = role.permissions
    ? role.permissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        createdAt: rp.permission.createdAt,
      }))
    : [];

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions,
    userCount: role._count?.users ?? 0,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}
