import { apiClient } from "../client.js";
import { NotificationItem } from "../../types/index.js";

export interface NotificationPreferenceData {
  emailNotifications?: boolean;
  projectUpdates?: boolean;
  paymentAlerts?: boolean;
  applicantSubmissions?: boolean;
  securityAlerts?: boolean;
  systemAnnouncements?: boolean;
}

export const notificationsService = {
  async getAll(params?: {
    unreadOnly?: boolean;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient<NotificationItem[]>("/notifications", { params });
  },

  async getUnreadCount() {
    return apiClient<{ count: number }>("/notifications/unread-count");
  },

  async getPreferences() {
    return apiClient<NotificationPreferenceData>("/notifications/preferences");
  },

  async updatePreferences(data: NotificationPreferenceData) {
    return apiClient<NotificationPreferenceData>("/notifications/preferences", {
      method: "PATCH",
      body: data,
    });
  },

  async markAsRead(id: string) {
    return apiClient(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAsUnread(id: string) {
    return apiClient(`/notifications/${id}/unread`, { method: "PATCH" });
  },

  async markAllAsRead() {
    return apiClient("/notifications/read-all", { method: "POST" });
  },
};
