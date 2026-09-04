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

  async getRequirements(projectId: string) {
    return apiClient<any[]>(`/projects/${projectId}/requirements`);
  },

  async createRequirement(projectId: string, data: { title: string; description?: string; priority?: string; status?: string }) {
    return apiClient<any>(`/projects/${projectId}/requirements`, {
      method: "POST",
      body: data,
    });
  },

  async updateRequirement(projectId: string, requirementId: string, data: { title?: string; description?: string; priority?: string; status?: string; isCompleted?: boolean }) {
    return apiClient<any>(`/projects/${projectId}/requirements/${requirementId}`, {
      method: "PATCH",
      body: data,
    });
  },

  async deleteRequirement(projectId: string, requirementId: string) {
    return apiClient(`/projects/${projectId}/requirements/${requirementId}`, {
      method: "DELETE",
    });
  },
};
