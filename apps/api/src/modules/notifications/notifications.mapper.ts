import { NotificationPreferenceResponse, NotificationResponse } from "./notifications.types.js";

/**
 * Maps raw Prisma Notification record to clean response DTO.
 */
export function sanitizeNotificationResponse(notification: any): NotificationResponse {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    notificationType: notification.notificationType,
    priority: notification.priority,
    status: notification.status,
    actionUrl: notification.actionUrl || null,
    entityType: notification.entityType || null,
    entityId: notification.entityId || null,
    metadata: (notification.metadata as Record<string, any>) || null,
    createdAt: notification.createdAt,
    readAt: notification.readAt || null,
  };
}

/**
 * Maps raw Prisma NotificationPreference record to clean response DTO.
 */
export function sanitizeNotificationPreferenceResponse(preference: any): NotificationPreferenceResponse {
  return {
    id: preference.id,
    userId: preference.userId,
    emailEnabled: preference.emailEnabled,
    systemEnabled: preference.systemEnabled,
    clientEnabled: preference.clientEnabled,
    projectEnabled: preference.projectEnabled,
    paymentEnabled: preference.paymentEnabled,
    securityEnabled: preference.securityEnabled,
    announcementEnabled: preference.announcementEnabled,
    createdAt: preference.createdAt,
    updatedAt: preference.updatedAt,
  };
}
