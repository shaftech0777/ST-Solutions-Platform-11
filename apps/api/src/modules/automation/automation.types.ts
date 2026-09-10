export const AUTOMATION_EVENTS = {
  CONTACT_MESSAGE_RECEIVED: "contact.message.received",
  PROJECT_INQUIRY_CREATED: "project_inquiry.created",
  MEMBER_APPLICATION_SUBMITTED: "member_application.submitted",
  MEMBER_APPLICATION_APPROVED: "member_application.approved",
  MEMBER_APPLICATION_REJECTED: "member_application.rejected",
  MEMBER_APPLICATION_MORE_INFORMATION_REQUIRED: "member_application.more_information_required",
  MEMBER_APPLICATION_STATUS_CHANGED: "member_application.status_changed",
  MARKETING_SUBSCRIBER_ADDED: "marketing.subscriber.added",
  MARKETING_CAMPAIGN_REQUESTED: "marketing.campaign.requested",
  SYSTEM_TEST_DISPATCHED: "system.test.dispatched",
} as const;

export type AutomationEventName = (typeof AUTOMATION_EVENTS)[keyof typeof AUTOMATION_EVENTS];

export type AutomationStatus =
  | "PENDING"
  | "PROCESSING"
  | "ACCEPTED_BY_N8N"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "RETRYING"
  | "BOUNCED";

export interface AutomationPayloadEnvelope<T = Record<string, any>> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  source: "st-solutions-platform";
  version: 1;
  deliveryId: string;
  // Aliases for compatibility with workflows and legacy handlers:
  eventName: string;
  timestamp: string;
  environment: string;
  recipient?: string | null;
  adminNotificationEmail: string;
  callbackUrl: string;
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
  callbackUrl: string;
  timeoutMs: number;
  deliveryStats: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    retrying: number;
    accepted: number;
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
  status: "ACCEPTED_BY_N8N" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED";
  providerMessageId?: string;
  responseCode?: number;
  responseBody?: string;
  failureReason?: string;
  deliveredAt?: string;
}
