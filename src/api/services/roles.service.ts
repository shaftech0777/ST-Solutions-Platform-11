import { apiClient } from "../client.js";

export interface PermissionItem {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  module?: string | null;
  action?: string | null;
  isSystem?: boolean;
  createdAt: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  userCount?: number;
  usersCount?: number;
  permissions?: PermissionItem[] | Array<{ permission: PermissionItem; permissionId: string }>;
  createdAt: string;
  updatedAt?: string;
}

export const rolesService = {
  async getRoles(params?: { search?: string; page?: number; limit?: number }) {
    return apiClient<RoleItem[]>("/roles", { params });
  },

  async getRoleById(id: string) {
    return apiClient<RoleItem>(`/roles/${id}`);
  },

  async createRole(data: { name: string; description?: string; permissionIds?: string[] }) {
    return apiClient<RoleItem>("/roles", {
      method: "POST",
      body: data,
    });
  },

  async updateRole(id: string, data: { name?: string; description?: string }) {
    return apiClient<RoleItem>(`/roles/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async deleteRole(id: string) {
    return apiClient(`/roles/${id}`, {
      method: "DELETE",
    });
  },

  async getRolePermissions(roleId: string) {
    return apiClient<PermissionItem[]>(`/roles/${roleId}/permissions`);
  },

  async assignPermissions(roleId: string, permissionIds: string[]) {
    return apiClient(`/roles/${roleId}/permissions`, {
      method: "POST",
      body: { permissionIds },
    });
  },

  async getPermissions(params?: { category?: string; search?: string; limit?: number }) {
    return apiClient<PermissionItem[]>("/permissions", { params });
  },

  async createPermission(data: { name: string; description?: string; category?: string }) {
    return apiClient<PermissionItem>("/permissions", {
      method: "POST",
      body: data,
    });
  },
};
