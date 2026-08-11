import { NotificationPriority, NotificationType } from "@prisma/client";

export type NotificationChannel = "IN_APP" | "EMAIL" | "WHATSAPP" | "PUSH";

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
}

export interface INotificationProvider {
  readonly channel: NotificationChannel;
  send(payload: SendNotificationPayload): Promise<boolean>;
}
