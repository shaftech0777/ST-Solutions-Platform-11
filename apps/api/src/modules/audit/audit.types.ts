export interface AuditLogUserSummary {
  id: string;
  fullName: string;
  email: string | null;
}

export interface AuditLogResponse {
  id: string;
  userId: string | null;
  action: string;
  description: string | null;
  ipAddress: string | null;
  createdAt: Date;
  user: AuditLogUserSummary | null;
}

export interface CreateAuditLogInput {
  userId?: string | null;
  action: string;
  description?: string | null;
  ipAddress?: string | null;
}

export interface AuditLogQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "action" | "userId";
  sortOrder?: "asc" | "desc";
}

export interface AuditLogStatistics {
  totalLogs: number;
  recentLogs24h: number;
  recentLogs30d: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}
