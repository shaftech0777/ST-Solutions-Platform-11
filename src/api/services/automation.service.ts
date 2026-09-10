import { apiClient } from "../client.js";

export interface AutomationSystemStatus {
  enabled: boolean;
  baseUrl: string;
  callbackUrl: string;
  masterWebhookPath?: string;
  masterWebhookUrl?: string;
  configured: boolean;
  webhookSecretConfigured: boolean;
  adminNotificationEmail: string;
  timeoutMs: number;
  deliveryStats: {
    total: number;
    delivered: number;
    accepted: number;
    failed: number;
    pending: number;
    retrying: number;
  };
  lastDeliveredAt: string | null;
}

export interface AutomationLogItem {
  id: string;
  deliveryId: string;
  event: string;
  recipient: string | null;
  status: "PENDING" | "PROCESSING" | "ACCEPTED_BY_N8N" | "SENT" | "DELIVERED" | "FAILED" | "RETRYING" | "BOUNCED" | "SKIPPED";
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  lastAttemptAt: string | null;
  processedAt: string | null;
  responseCode: number | null;
  responseBody: string | null;
  providerMsgId: string | null;
  failureReason: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationLogFilters {
  event?: string;
  status?: string;
  recipient?: string;
  page?: number;
  limit?: number;
}

export const automationService = {
  async getStatus() {
    return apiClient<AutomationSystemStatus>("/automation/status");
  },

  async getLogs(filters: AutomationLogFilters = {}) {
    const params = new URLSearchParams();
    if (filters.event) params.set("event", filters.event);
    if (filters.status) params.set("status", filters.status);
    if (filters.recipient) params.set("recipient", filters.recipient);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());

    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient<AutomationLogItem[]>(`/automation/logs${qs}`);
  },

  async sendTestEvent(recipientEmail?: string) {
    return apiClient<{ message: string; result: any }>("/automation/test", {
      method: "POST",
      body: { recipientEmail },
    });
  },

  async getSubscribers(page: number = 1, limit: number = 50) {
    return apiClient<any[]>(`/newsletter?page=${page}&limit=${limit}`);
  },

  async broadcastNewsletter(data: { title: string; subject: string; content: string }) {
    return apiClient<{ recipientCount: number; status: string }>("/newsletter/broadcast", {
      method: "POST",
      body: data,
    });
  },
};
