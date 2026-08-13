import { apiClient } from "../client.js";
import { AuditLogItem } from "../../types/index.js";

export const auditService = {
  async getAll(params?: { action?: string; userId?: string; page?: number; limit?: number }) {
    return apiClient<AuditLogItem[]>("/audit-logs", { params });
  },
};
