import { apiClient } from "../client.js";

export const settingsService = {
  async getSettings() {
    return apiClient<Record<string, any>>("/settings");
  },

  async updateSettings(data: Record<string, any>) {
    return apiClient("/settings", {
      method: "PUT",
      body: data,
    });
  },
};
