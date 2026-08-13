import { apiClient } from "../client.js";
import { Organization } from "../../types/index.js";

export const organizationsService = {
  async getAll() {
    return apiClient<Organization[]>("/organizations");
  },

  async getById(id: string) {
    return apiClient<Organization>(`/organizations/${id}`);
  },

  async create(data: { name: string; slug?: string }) {
    return apiClient<Organization>("/organizations", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: { name?: string; slug?: string }) {
    return apiClient<Organization>(`/organizations/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async getMembers(orgId: string) {
    return apiClient<any[]>(`/organizations/${orgId}/members`);
  },

  async inviteMember(orgId: string, data: { email: string; role: string }) {
    return apiClient(`/organizations/${orgId}/invitations`, {
      method: "POST",
      body: data,
    });
  },

  async updateMemberRole(orgId: string, userId: string, role: string) {
    return apiClient(`/organizations/${orgId}/members/${userId}/role`, {
      method: "PATCH",
      body: { role },
    });
  },

  async removeMember(orgId: string, userId: string) {
    return apiClient(`/organizations/${orgId}/members/${userId}`, {
      method: "DELETE",
    });
  },
};
