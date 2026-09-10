export const AUTOMATION_EVENTS = {
  // Public website & intake events
  CONTACT_MESSAGE_RECEIVED: "contact.message.received",
  CLIENT_REQUEST_CREATED: "client_request.created",
  PROJECT_INQUIRY_CREATED: "project_inquiry.created",

  // Project lifecycle events
  PROJECT_CREATED: "project.created",
  PROJECT_STARTED: "project.started",
  PROJECT_STATUS_CHANGED: "project.status.changed",
  PROJECT_PROGRESS_UPDATED: "project.progress.updated",
  PROJECT_UPDATE_CREATED: "project.update.created",
  PROJECT_COMPLETED: "project.completed",

  // Client lifecycle events
  CLIENT_CREATED: "client.created",
  CLIENT_STATUS_CHANGED: "client.status.changed",

  // Payment lifecycle events
  PAYMENT_CREATED: "payment.created",
  PAYMENT_SUBMITTED: "payment.submitted",
  PAYMENT_APPROVED: "payment.approved",
  PAYMENT_REJECTED: "payment.rejected",

  // Member Application & Onboarding
  MEMBER_APPLICATION_SUBMITTED: "member_application.submitted",
  MEMBER_APPLICATION_APPROVED: "member_application.approved",
  MEMBER_APPLICATION_REJECTED: "member_application.rejected",
  MEMBER_APPLICATION_MORE_INFORMATION_REQUIRED: "member_application.more_information_required",
  MEMBER_APPLICATION_STATUS_CHANGED: "member_application.status_changed",
  MEMBER_ONBOARDED: "member.onboarded",

  // Marketing & Subscriber Events
  MARKETING_SUBSCRIBER_ADDED: "marketing.subscriber.added",
  MARKETING_CAMPAIGN_REQUESTED: "marketing.campaign.requested",

  // System
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
