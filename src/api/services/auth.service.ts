import { apiClient } from "../client.js";
import { LoginResponse, User } from "../../types/index.js";

export const authService = {
  async login(credentials: { email?: string; username?: string; password: string }) {
    return apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async register(data: { email: string; password: string; fullName?: string }) {
    return apiClient<{ user: User; accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  async getMe() {
    return apiClient<{ user: User; permissions?: string[] }>("/auth/me");
  },

  async logout() {
    return apiClient("/auth/logout", { method: "POST" });
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient("/auth/change-password", {
      method: "POST",
      body: data,
    });
  },
};
