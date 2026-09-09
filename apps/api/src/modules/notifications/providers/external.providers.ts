import { INotificationProvider, NotificationChannel, SendNotificationPayload } from "./notification-provider.interface.js";
import { automationService } from "../../automation/index.js";

/**
 * Enterprise Email Notification Provider hooked to n8n Automation Engine.
 */
export class EmailNotificationProvider implements INotificationProvider {
  public readonly channel: NotificationChannel = "EMAIL";

  public async send(payload: SendNotificationPayload): Promise<boolean> {
    try {
      await automationService.dispatch(
        "notification.email.send",
        {
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          notificationType: payload.notificationType,
          priority: payload.priority,
          actionUrl: payload.actionUrl,
          metadata: payload.metadata,
        },
        {
          recipient: payload.metadata?.email || null,
          entityType: payload.entityType || undefined,
          entityId: payload.entityId || undefined,
        }
      );
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Stub WhatsApp Notification Provider abstraction for future WhatsApp Business API integration.
 */
export class WhatsAppNotificationProvider implements INotificationProvider {
  public readonly channel: NotificationChannel = "WHATSAPP";

  public async send(_payload: SendNotificationPayload): Promise<boolean> {
    // External delivery intentionally deferred; channel abstraction ready for production adapter
    return true;
  }
}

/**
 * Stub Push Notification Provider abstraction for future Firebase Cloud Messaging / WebPush integration.
 */
export class PushNotificationProvider implements INotificationProvider {
  public readonly channel: NotificationChannel = "PUSH";

  public async send(_payload: SendNotificationPayload): Promise<boolean> {
    // External delivery intentionally deferred; channel abstraction ready for production adapter
    return true;
  }
}
