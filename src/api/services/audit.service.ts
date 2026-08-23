import { apiClient } from "../client.js";
import { AuditLogItem } from "../../types/index.js";

export interface AuditStatisticsData {
  totalLogs: number;
  actionCounts?: Record<string, number>;
  recentActivitiesCount?: number;
}

export const auditService = {
  async getAll(params?: {
    action?: string;
    actorId?: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return apiClient<AuditLogItem[]>("/audit-logs", { params });
  },

  async getStatistics() {
    return apiClient<AuditStatisticsData>("/audit-logs/statistics");
  },

  async getById(id: string) {
    return apiClient<AuditLogItem>(`/audit-logs/${id}`);
  },
};
