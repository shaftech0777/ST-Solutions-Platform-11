import { INotificationProvider, NotificationChannel, SendNotificationPayload } from "./notification-provider.interface.js";

/**
 * Stub Email Notification Provider abstraction for future SMTP / SES integration.
 */
export class EmailNotificationProvider implements INotificationProvider {
  public readonly channel: NotificationChannel = "EMAIL";

  public async send(_payload: SendNotificationPayload): Promise<boolean> {
    // External delivery intentionally deferred; channel abstraction ready for production adapter
    return true;
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
