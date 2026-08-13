import { apiClient } from "../client.js";
import { Applicant, ApplicantStatus } from "../../types/index.js";

export const applicantsService = {
  async getAll(params?: { status?: ApplicantStatus; search?: string; page?: number; limit?: number }) {
    return apiClient<Applicant[]>("/applicants", { params });
  },

  async getById(id: string) {
    return apiClient<Applicant>(`/applicants/${id}`);
  },

  async create(data: {
    fullName: string;
    email: string;
    phone?: string;
    positionApplied: string;
    resumeUrl?: string;
    notes?: string;
  }) {
    return apiClient<Applicant>("/applicants", {
      method: "POST",
      body: data,
    });
  },

  async updateStatus(id: string, status: ApplicantStatus) {
    return apiClient<Applicant>(`/applicants/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
};
