import { apiClient } from "../client.js";

export interface MemberItem {
  id: string;
  userId: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  rank?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    accountType: string;
    status: string;
    profile?: {
      id?: string;
      fullName?: string | null;
      phoneNumber?: string | null;
      country?: string | null;
      city?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
  role?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
}

export interface MemberStatisticsData {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  roleBreakdown?: Record<string, number>;
}

export const membersService = {
  async getAll(params?: {
    search?: string;
    status?: string;
    rank?: string;
    organizationId?: string;
    workspaceId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return apiClient<MemberItem[]>("/members", { params });
  },

  async getStatistics() {
    return apiClient<MemberStatisticsData>("/members/statistics");
  },

  async getMe() {
    return apiClient<MemberItem>("/members/me");
  },

  async getById(id: string) {
    return apiClient<MemberItem>(`/members/${id}`);
  },

  async updateProfile(id: string, data: {
    fullName?: string;
    phoneNumber?: string;
    country?: string;
    city?: string;
    address?: string;
  }) {
    return apiClient<MemberItem>(`/members/${id}/profile`, {
      method: "PATCH",
      body: data,
    });
  },

  async updateStatus(id: string, status: string, reason?: string) {
    return apiClient<MemberItem>(`/members/${id}/status`, {
      method: "PATCH",
      body: { status, reason },
    });
  },

  async updateRank(id: string, rank: string) {
    return apiClient<MemberItem>(`/members/${id}/rank`, {
      method: "PATCH",
      body: { rank },
    });
  },

  async delete(id: string) {
    return apiClient(`/members/${id}`, {
      method: "DELETE",
    });
  },
};
