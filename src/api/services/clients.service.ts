import { apiClient } from "../client.js";
import { Client } from "../../types/index.js";

export const clientsService = {
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    return apiClient<Client[]>("/clients", { params });
  },

  async getById(id: string) {
    return apiClient<Client>(`/clients/${id}`);
  },

  async create(data: Partial<Client>) {
    return apiClient<Client>("/clients", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: Partial<Client>) {
    return apiClient<Client>(`/clients/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string) {
    return apiClient(`/clients/${id}`, { method: "DELETE" });
  },

  async updateStatus(id: string, clientStatus: string, statusReason?: string) {
    return apiClient<Client>(`/clients/${id}/status`, {
      method: "PATCH",
      body: { clientStatus, statusReason },
    });
  },

  async updateOwnership(id: string, data: { memberId?: string; assignedManagerId?: string; notes?: string }) {
    return apiClient<Client>(`/clients/${id}/owner`, {
      method: "PATCH",
      body: data,
    });
  },

  async getCommunications(clientId: string) {
    return apiClient<any[]>(`/clients/${clientId}/communications`);
  },

  async createCommunication(clientId: string, data: { type?: string; destination?: string; subject?: string; content: string }) {
    return apiClient<any>(`/clients/${clientId}/communications`, {
      method: "POST",
      body: data,
    });
  },
};
