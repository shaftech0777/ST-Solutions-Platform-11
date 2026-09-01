import { apiClient } from "../client.js";
import {
  InquiryContactMethod,
  InquiryPriority,
  InquiryStatus,
  ProjectInquiry,
  ProjectInquiryStats,
} from "../../types/index.js";

export const inquiriesService = {
  /**
   * Submit public visitor project inquiry
   */
  async submitPublicInquiry(data: {
    visitorName: string;
    email: string;
    phone: string;
    companyName?: string;
    country?: string;
    projectId?: string;
    projectNameSnapshot: string;
    category?: string;
    message: string;
    preferredContactMethod?: InquiryContactMethod;
    budget?: string;
    preferredContactTime?: string;
  }) {
    return apiClient<{ id: string; visitorName: string; projectNameSnapshot: string }>(
      "/public/project-inquiries",
      {
        method: "POST",
        body: data,
      }
    );
  },

  /**
   * Get all inquiries with filters & pagination
   */
  async getAll(params?: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    projectId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return apiClient<ProjectInquiry[]>("/inquiries", { params });
  },

  /**
   * Get inquiry by ID
   */
  async getById(id: string) {
    return apiClient<ProjectInquiry>(`/inquiries/${id}`);
  },

  /**
   * Get telemetry statistics
   */
  async getStatistics() {
    return apiClient<ProjectInquiryStats>("/inquiries/statistics");
  },

  /**
   * Update status, priority, or notes
   */
  async update(
    id: string,
    data: {
      status?: InquiryStatus;
      priority?: InquiryPriority;
      adminNotes?: string;
    }
  ) {
    return apiClient<ProjectInquiry>(`/inquiries/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  /**
   * Record a contact attempt (WhatsApp, Email, Phone)
   */
  async recordContact(
    id: string,
    data: {
      contactMethod: InquiryContactMethod;
      notes?: string;
      updateStatusToContacted?: boolean;
    }
  ) {
    return apiClient<ProjectInquiry>(`/inquiries/${id}/contact`, {
      method: "POST",
      body: data,
    });
  },

  /**
   * Add internal administrative note
   */
  async addNote(id: string, notes: string) {
    return apiClient<ProjectInquiry>(`/inquiries/${id}/notes`, {
      method: "POST",
      body: { notes },
    });
  },

  /**
   * Delete inquiry
   */
  async delete(id: string) {
    return apiClient<{ success: boolean; id: string }>(`/inquiries/${id}`, {
      method: "DELETE",
    });
  },
};
