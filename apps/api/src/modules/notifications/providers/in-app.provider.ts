import { INotificationProvider, NotificationChannel, SendNotificationPayload } from "./notification-provider.interface.js";
import { NotificationsRepository } from "../notifications.repository.js";

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
      await this.repository.createNotification({
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
      return true;
    } catch {
      return false;
    }
  }
}
