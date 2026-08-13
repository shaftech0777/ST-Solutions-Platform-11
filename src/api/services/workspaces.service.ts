import { apiClient } from "../client.js";
import { Workspace } from "../../types/index.js";

export const workspacesService = {
  async getAll(orgId?: string) {
    return apiClient<Workspace[]>("/workspaces", {
      params: { organizationId: orgId },
    });
  },

  async getById(id: string) {
    return apiClient<Workspace>(`/workspaces/${id}`);
  },

  async create(data: { name: string; description?: string; organizationId?: string }) {
    return apiClient<Workspace>("/workspaces", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: { name?: string; description?: string }) {
    return apiClient<Workspace>(`/workspaces/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string) {
    return apiClient(`/workspaces/${id}`, { method: "DELETE" });
  },

  async getMembers(wsId: string) {
    return apiClient<any[]>(`/workspaces/${wsId}/members`);
  },
};
