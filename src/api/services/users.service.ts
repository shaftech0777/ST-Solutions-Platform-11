import { apiClient } from "../client.js";
import { User, AccountType, UserStatus } from "../../types/index.js";

export interface UserQueryOptions {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  accountType?: AccountType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserData {
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  password: string;
  accountType?: AccountType;
  status?: UserStatus;
  roleId?: string;
  profile?: {
    fullName?: string;
    profileImage?: string;
    phoneNumber?: string;
    country?: string;
    city?: string;
    address?: string;
  };
}

export interface UpdateUserData {
  email?: string;
  profile?: {
    fullName?: string | null;
    profileImage?: string | null;
    phoneNumber?: string | null;
    country?: string | null;
    city?: string | null;
    address?: string | null;
  };
}

export const usersService = {
  async getAll(params?: UserQueryOptions) {
    return apiClient<User[]>("/users", { params });
  },

  async getById(id: string) {
    return apiClient<User>(`/users/${id}`);
  },

  async create(data: CreateUserData) {
    return apiClient<User>("/users", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: UpdateUserData) {
    return apiClient<User>(`/users/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async updateStatus(id: string, status: UserStatus) {
    return apiClient<User>(`/users/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  async updateRole(id: string, data: { roleId?: string | null; accountType?: AccountType }) {
    return apiClient<User>(`/users/${id}/role`, {
      method: "PATCH",
      body: data,
    });
  },

  async delete(id: string) {
    return apiClient<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  async resetPassword(id: string, newPassword: string) {
    return apiClient<{ message: string }>(`/users/${id}/reset-password`, {
      method: "POST",
      body: { newPassword },
    });
  },

  async getPerformance(id: string) {
    return apiClient<any>(`/users/${id}/performance`);
  },

  async getTeamTree(organizationId?: string) {
    return apiClient<any[]>("/users/team-tree", {
      params: organizationId ? { organizationId } : undefined,
    });
  },
};
