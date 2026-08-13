import { apiClient } from "../client.js";
import { Project, ProjectStatus } from "../../types/index.js";

export const projectsService = {
  async getAll(params?: { status?: ProjectStatus; search?: string; page?: number; limit?: number }) {
    return apiClient<Project[]>("/projects", { params });
  },

  async getById(id: string) {
    return apiClient<Project>(`/projects/${id}`);
  },

  async create(data: {
    clientId: string;
    title: string;
    description?: string;
    budget?: number;
    startDate?: string;
    expectedCompletionDate?: string;
    projectStatus?: ProjectStatus;
  }) {
    return apiClient<Project>("/projects", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: Partial<Project>) {
    return apiClient<Project>(`/projects/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async updateStatus(id: string, projectStatus: ProjectStatus) {
    return apiClient<Project>(`/projects/${id}/status`, {
      method: "PATCH",
      body: { projectStatus },
    });
  },

  async delete(id: string) {
    return apiClient(`/projects/${id}`, { method: "DELETE" });
  },
};
