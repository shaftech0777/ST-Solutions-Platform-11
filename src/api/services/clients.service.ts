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
};
