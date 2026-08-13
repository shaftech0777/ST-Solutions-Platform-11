import { apiClient } from "../client.js";
import { NotificationItem } from "../../types/index.js";

export const notificationsService = {
  async getAll(params?: { unreadOnly?: boolean; page?: number; limit?: number }) {
    return apiClient<NotificationItem[]>("/notifications", { params });
  },

  async markAsRead(id: string) {
    return apiClient(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllAsRead() {
    return apiClient("/notifications/read-all", { method: "POST" });
  },
};
