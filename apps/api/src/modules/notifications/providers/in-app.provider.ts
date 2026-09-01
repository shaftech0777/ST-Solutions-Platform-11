import { INotificationProvider, NotificationChannel, SendNotificationPayload } from "./notification-provider.interface.js";
import { NotificationsRepository } from "../notifications.repository.js";
import { sanitizeNotificationResponse } from "../notifications.mapper.js";
import { notificationStreamManager } from "../notifications.stream.js";

/**
 * Concrete provider delivering real-time persistent in-app notifications.
 */
export class InAppNotificationProvider implements INotificationProvider {
  public readonly channel: NotificationChannel = "IN_APP";
  private readonly repository: NotificationsRepository;

  constructor(repository: NotificationsRepository) {
    this.repository = repository;
  }

  public async send(payload: SendNotificationPayload): Promise<boolean> {
    try {
      const created = await this.repository.createNotification({
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        notificationType: payload.notificationType,
        priority: payload.priority || "NORMAL",
        actionUrl: payload.actionUrl || null,
        entityType: payload.entityType || null,
        entityId: payload.entityId || null,
        metadata: payload.metadata || undefined,
      });

      // Real-time broadcast to connected client SSE streams
      try {
        const sanitized = sanitizeNotificationResponse(created);
        notificationStreamManager.broadcastNotification(payload.userId, sanitized);

        const unreadCount = await this.repository.getUnreadCount(payload.userId);
        notificationStreamManager.broadcastUnreadCount(payload.userId, unreadCount);
      } catch {
        // Non-blocking stream broadcast error
      }

      return true;
    } catch {
      return false;
    }
  }
}

