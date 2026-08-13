import { apiClient } from "../client.js";

export const rolesService = {
  async getRoles() {
    return apiClient<any[]>("/roles");
  },

  async getPermissions() {
    return apiClient<any[]>("/permissions");
  },

  async createRole(data: { name: string; description?: string; permissionIds?: string[] }) {
    return apiClient("/roles", {
      method: "POST",
      body: data,
    });
  },
};
