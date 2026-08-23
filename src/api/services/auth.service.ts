import { apiClient } from "../client.js";
import { LoginResponse, User } from "../../types/index.js";

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  accountType?: "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";
  organizationName?: string;
}

export interface AuthSuccessPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export const authService = {
  async login(credentials: { email?: string; username?: string; password: string }) {
    return apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async register(data: RegisterPayload) {
    return apiClient<AuthSuccessPayload>("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  async getMe() {
    return apiClient<{
      id: string;
      email: string;
      accountType: "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
      roleId?: string | null;
      roleName?: string;
      permissions: string[];
      profile?: {
        fullName?: string | null;
        profileImage?: string | null;
        phoneNumber?: string | null;
        country?: string | null;
        city?: string | null;
        address?: string | null;
      } | null;
      createdAt: string;
      updatedAt: string;
      user?: User;
    }>("/auth/me");
  },

  async refreshToken(refreshToken: string) {
    return apiClient<{ accessToken: string; refreshToken: string; expiresIn: number; tokenType: "Bearer" }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  async logout() {
    return apiClient<{ message: string }>("/auth/logout", { method: "POST" });
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: data,
    });
  },
};

