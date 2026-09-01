import { apiClient, normalizeApiUrl, getStoredAccessToken } from "../client.js";
import { NotificationItem } from "../../types/index.js";

export interface NotificationPreferenceData {
  emailNotifications?: boolean;
  projectUpdates?: boolean;
  paymentAlerts?: boolean;
  applicantSubmissions?: boolean;
  securityAlerts?: boolean;
  systemAnnouncements?: boolean;
}

export const notificationsService = {
  async getAll(params?: {
    unreadOnly?: boolean;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient<NotificationItem[]>("/notifications", { params });
  },

  async getUnreadCount() {
    return apiClient<{ count: number }>("/notifications/unread-count");
  },

  async getPreferences() {
    return apiClient<NotificationPreferenceData>("/notifications/preferences");
  },

  async updatePreferences(data: NotificationPreferenceData) {
    return apiClient<NotificationPreferenceData>("/notifications/preferences", {
      method: "PATCH",
      body: data,
    });
  },

  async markAsRead(id: string) {
    return apiClient(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAsUnread(id: string) {
    return apiClient(`/notifications/${id}/unread`, { method: "PATCH" });
  },

  async markAllAsRead() {
    return apiClient("/notifications/read-all", { method: "POST" });
  },

  /**
   * Returns the absolute Server-Sent Events (SSE) URL for real-time notifications.
   */
  getStreamUrl(): string {
    return normalizeApiUrl("/notifications/stream");
  },

  /**
   * Creates an authenticated, secure SSE stream via fetch & ReadableStream
   * using standard Authorization: Bearer <token> headers (never exposes token in query params).
   */
  createStream(callbacks?: {
    onNotification?: (notification: NotificationItem) => void;
    onUnreadCount?: (count: number) => void;
    onError?: (err: any) => void;
    onOpen?: () => void;
  }): { close: () => void } {
    const abortController = new AbortController();
    let isClosed = false;
    let reconnectTimeout: any = null;

    const connect = async () => {
      if (isClosed) return;

      const token = getStoredAccessToken();
      if (!token) {
        callbacks?.onError?.(new Error("No access token available for notification stream"));
        return;
      }

      const streamUrl = normalizeApiUrl("/notifications/stream");

      try {
        const response = await fetch(streamUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE stream failed with status ${response.status}`);
        }

        callbacks?.onOpen?.();

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (!isClosed) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "message";
          let currentData = "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) {
              // Comment or heartbeat ping (: keepalive)
              continue;
            }

            if (trimmed.startsWith("event:")) {
              currentEvent = trimmed.slice(6).trim();
            } else if (trimmed.startsWith("data:")) {
              currentData = trimmed.slice(5).trim();

              if (currentEvent === "notification" && currentData) {
                try {
                  const notif = JSON.parse(currentData);
                  callbacks?.onNotification?.(notif);
                } catch {
                  // Non-fatal parse error
                }
              } else if (currentEvent === "unread_count" && currentData) {
                try {
                  const parsed = JSON.parse(currentData);
                  if (typeof parsed.unreadCount === "number") {
                    callbacks?.onUnreadCount?.(parsed.unreadCount);
                  }
                } catch {
                  // Non-fatal parse error
                }
              }
              currentEvent = "message";
              currentData = "";
            }
          }
        }
      } catch (err: any) {
        if (!isClosed && err.name !== "AbortError") {
          callbacks?.onError?.(err);
          // Auto reconnect after 4 seconds
          reconnectTimeout = setTimeout(() => {
            if (!isClosed) {
              connect();
            }
          }, 4000);
        }
      }
    };

    connect();

    return {
      close: () => {
        isClosed = true;
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        abortController.abort();
      },
    };
  },
};

