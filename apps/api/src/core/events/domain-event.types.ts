/**
 * Centralized constant declaration of all platform Domain Event names.
 */
export const DOMAIN_EVENTS = {
  // Client Domain Events
  CLIENT_CREATED: "client.created",
  CLIENT_UPDATED: "client.updated",
  CLIENT_STATUS_CHANGED: "client.status.changed",
  CLIENT_OWNERSHIP_CHANGED: "client.ownership.changed",

  // Project Domain Events
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_STATUS_CHANGED: "project.status.changed",
  PROJECT_COMPLETED: "project.completed",
  PROJECT_UPDATE_CREATED: "project.update.created",

  // Payment Domain Events
  PAYMENT_CREATED: "payment.created",
  PAYMENT_SUBMITTED: "payment.submitted",
  PAYMENT_APPROVED: "payment.approved",
  PAYMENT_REJECTED: "payment.rejected",

  // Client Request Domain Events
  CLIENT_REQUEST_CREATED: "client_request.created",
  CLIENT_REQUEST_STATUS_CHANGED: "client_request.status.changed",
  CLIENT_REQUEST_CONVERTED: "client_request.converted",

  // Project Inquiry Domain Events
  PROJECT_INQUIRY_CREATED: "project_inquiry.created",
  PROJECT_INQUIRY_STATUS_CHANGED: "project_inquiry.status.changed",
  PROJECT_INQUIRY_CONTACTED: "project_inquiry.contacted",

  // Contact Message Events
  CONTACT_MESSAGE_RECEIVED: "contact.message.received",

  // Applicant & Hiring Automation Events
  MEMBER_APPLICATION_SUBMITTED: "member_application.submitted",
  MEMBER_APPLICATION_APPROVED: "member_application.approved",
  MEMBER_APPLICATION_REJECTED: "member_application.rejected",
  MEMBER_APPLICATION_STATUS_CHANGED: "member_application.status_changed",

  // Marketing & Subscriber Events
  MARKETING_SUBSCRIBER_ADDED: "marketing.subscriber.added",

  // Settings & Security Domain Events
  SETTINGS_UPDATED: "settings.updated",
  SECURITY_EVENT: "security.event",

  // User & Auth Domain Events
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGGED_OUT: "user.logged_out",
  PASSWORD_CHANGED: "password.changed",

  // Organization & Workspace Domain Events
  ORGANIZATION_CREATED: "organization.created",
  WORKSPACE_CREATED: "workspace.created",

  // Membership & Role Domain Events
  MEMBER_INVITED: "member.invited",
  MEMBER_JOINED: "member.joined",
  MEMBER_REMOVED: "member.removed",
  ROLE_ASSIGNED: "role.assigned",
  ROLE_REMOVED: "role.removed",
} as const;

export type DomainEventName = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

/**
 * Standard interface for all platform domain event envelopes.
 */
export interface DomainEvent<T = any> {
  eventName: string;
  entityType: string;
  entityId: string;
  actorId?: string | null;
  timestamp: Date;
  payload: T;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

// Domain-Specific Payload Definitions

export interface ClientCreatedPayload {
  clientId: string;
  companyName: string;
  email: string;
  fullName: string;
  memberId?: string | null;
  assignedManagerId?: string | null;
}

export interface ClientStatusChangedPayload {
  clientId: string;
  companyName: string;
  previousStatus?: string;
  newStatus: string;
  memberId?: string | null;
  assignedManagerId?: string | null;
}

export interface ClientOwnershipChangedPayload {
  clientId: string;
  companyName: string;
  previousMemberId?: string | null;
  newMemberId?: string | null;
  assignedManagerId?: string | null;
}

export interface ProjectCreatedPayload {
  projectId: string;
  title: string;
  clientId: string;
  assignedMemberId?: string | null;
  assignedManagerId?: string | null;
}

export interface ProjectStatusChangedPayload {
  projectId: string;
  title: string;
  previousStatus?: string;
  newStatus: string;
  assignedMemberId?: string | null;
  assignedManagerId?: string | null;
}

export interface ProjectCompletedPayload {
  projectId: string;
  title: string;
  clientId: string;
  assignedMemberId?: string | null;
  assignedManagerId?: string | null;
}

export interface ProjectUpdateCreatedPayload {
  projectId: string;
  projectTitle: string;
  updateTitle: string;
  assignedMemberId?: string | null;
  assignedManagerId?: string | null;
}

export interface PaymentCreatedPayload {
  paymentId: string;
  amount: number;
  currency: string;
  clientId: string;
  projectId?: string | null;
  status: string;
}

export interface PaymentSubmittedPayload {
  paymentId: string;
  amount: number;
  currency: string;
  clientId: string;
  projectId?: string | null;
  submittedByUserId?: string | null;
}

export interface PaymentApprovedPayload {
  paymentId: string;
  amount: number;
  currency: string;
  clientId: string;
  projectId?: string | null;
  approvedByUserId?: string | null;
}

export interface PaymentRejectedPayload {
  paymentId: string;
  amount: number;
  currency: string;
  clientId: string;
  projectId?: string | null;
  rejectedByUserId?: string | null;
  reason?: string | null;
}

export interface ClientRequestCreatedPayload {
  requestId: string;
  fullName: string;
  companyName?: string | null;
  email: string;
  message: string;
}

export interface ClientRequestStatusChangedPayload {
  requestId: string;
  fullName: string;
  previousStatus?: string;
  newStatus: string;
}

export interface ClientRequestConvertedPayload {
  requestId: string;
  clientId: string;
  companyName: string;
  convertedByUserId?: string | null;
}

export interface SettingsUpdatedPayload {
  section: string;
  updatedByUserId?: string | null;
}

export interface SecurityEventPayload {
  action: string;
  severity: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  targetUserId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}
