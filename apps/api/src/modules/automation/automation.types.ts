export const AUTOMATION_EVENTS = {
  CONTACT_MESSAGE_RECEIVED: "contact.message.received",
  PROJECT_INQUIRY_CREATED: "project_inquiry.created",
  MEMBER_APPLICATION_SUBMITTED: "member_application.submitted",
  MEMBER_APPLICATION_APPROVED: "member_application.approved",
  MEMBER_APPLICATION_REJECTED: "member_application.rejected",
  MEMBER_APPLICATION_STATUS_CHANGED: "member_application.status_changed",
  MARKETING_SUBSCRIBER_ADDED: "marketing.subscriber.added",
  SYSTEM_TEST_DISPATCHED: "system.test.dispatched",
} as const;

export type AutomationEventName = (typeof AUTOMATION_EVENTS)[keyof typeof AUTOMATION_EVENTS];

export type AutomationStatus = "PENDING" | "DELIVERED" | "FAILED" | "RETRYING" | "SKIPPED";

export interface AutomationPayloadEnvelope<T = Record<string, any>> {
  deliveryId: string;
  eventName: string;
  timestamp: string;
  source: "st-solutions-platform";
  environment: string;
  recipient?: string | null;
  adminNotificationEmail: string;
  data: T;
}

export interface AutomationDispatchOptions {
  recipient?: string | null;
  entityType?: string;
  entityId?: string;
  maxRetries?: number;
  syncWait?: boolean;
}

export interface AutomationDispatchResult {
  deliveryId: string;
  status: AutomationStatus;
  responseCode?: number | null;
  providerMsgId?: string | null;
  failureReason?: string | null;
  deliveredAt?: Date | null;
}

export interface AutomationStatusResponse {
  enabled: boolean;
  baseUrl: string;
  configured: boolean;
  webhookSecretConfigured: boolean;
  adminNotificationEmail: string;
  timeoutMs: number;
  deliveryStats: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  lastDeliveredAt?: Date | null;
}

export interface AutomationLogQueryFilters {
  event?: string;
  status?: AutomationStatus;
  recipient?: string;
  page?: number;
  limit?: number;
}

export interface N8nInboundCallbackPayload {
  deliveryId: string;
  status: "DELIVERED" | "FAILED" | "BOUNCED";
  providerMessageId?: string;
  responseCode?: number;
  responseBody?: string;
  failureReason?: string;
  deliveredAt?: string;
}
