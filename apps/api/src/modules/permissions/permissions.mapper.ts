import { PermissionResponse } from "./permissions.types.js";

/**
 * Transforms database Permission entity into a sanitized PermissionResponse payload.
 */
export function sanitizePermissionResponse(permission: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    roles?: number;
  };
}): PermissionResponse {
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description,
    roleCount: permission._count?.roles ?? 0,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}
