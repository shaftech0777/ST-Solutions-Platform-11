import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { BusinessError, NotFoundError } from "../../core/errors/index.js";
import {
  sanitizeNotificationPreferenceResponse,
  sanitizeNotificationResponse,
} from "./notifications.mapper.js";
import { NotificationsRepository } from "./notifications.repository.js";
import {
  CreateNotificationInput,
  NotificationPreferenceResponse,
  NotificationQueryFilters,
  NotificationResponse,
  UnreadCountResponse,
  UpdateNotificationPreferenceInput,
} from "./notifications.types.js";
import { InAppNotificationProvider, INotificationProvider } from "./providers/index.js";

export class NotificationsService {
  private readonly repository: NotificationsRepository;
  private readonly providers: INotificationProvider[];

  constructor(repository: NotificationsRepository) {
    this.repository = repository;
    this.providers = [new InAppNotificationProvider(repository)];
  }

  /**
   * Dispatches a notification across enabled channels for a user if preference allows.
   */
  public async sendNotification(input: CreateNotificationInput): Promise<boolean> {
    try {
      // Check user preferences
      let preferences = await this.repository.findPreferencesByUserId(input.userId);
      if (!preferences) {
        preferences = await this.repository.createDefaultPreferences(input.userId);
      }

      // Preference check for category
      const isEnabled = this.isNotificationTypeEnabled(input.notificationType, preferences);
      if (!isEnabled) {
        return false;
      }

      // Dispatch across active providers
      for (const provider of this.providers) {
        await provider.send({
          userId: input.userId,
          title: input.title,
          message: input.message,
          notificationType: input.notificationType,
          priority: input.priority || "NORMAL",
          actionUrl: input.actionUrl,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: input.metadata,
        });
      }

      return true;
    } catch {
      // Non-blocking catch to ensure callers are protected
      return false;
    }
  }

  public async getUserNotifications(
    userId: string,
    filters: NotificationQueryFilters
  ): Promise<{ data: NotificationResponse[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [items, total] = await Promise.all([
      this.repository.findNotificationsByUserId(userId, filters),
      this.repository.countNotificationsByUserId(userId, filters),
    ]);

    return {
      data: items.map(sanitizeNotificationResponse),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    const count = await this.repository.getUnreadCount(userId);
    return { unreadCount: count };
  }

  public async markAsRead(notificationId: string, currentUserId: string): Promise<NotificationResponse> {
    const notification = await this.repository.findNotificationById(notificationId);
    if (!notification) {
      throw new NotFoundError(
        `Notification '${notificationId}' not found.`,
        ERROR_CODES.NOTIFICATION_NOT_FOUND
      );
    }

    if (notification.userId !== currentUserId) {
      throw new BusinessError(
        `Unauthorized access to notification '${notificationId}'.`,
        ERROR_CODES.NOTIFICATION_UNAUTHORIZED
      );
    }

    const updated = await this.repository.markAsRead(notificationId);
    return sanitizeNotificationResponse(updated);
  }

  public async markAsUnread(notificationId: string, currentUserId: string): Promise<NotificationResponse> {
    const notification = await this.repository.findNotificationById(notificationId);
    if (!notification) {
      throw new NotFoundError(
        `Notification '${notificationId}' not found.`,
        ERROR_CODES.NOTIFICATION_NOT_FOUND
      );
    }

    if (notification.userId !== currentUserId) {
      throw new BusinessError(
        `Unauthorized access to notification '${notificationId}'.`,
        ERROR_CODES.NOTIFICATION_UNAUTHORIZED
      );
    }

    const updated = await this.repository.markAsUnread(notificationId);
    return sanitizeNotificationResponse(updated);
  }

  public async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.repository.markAllAsRead(userId);
    return { success: true };
  }

  public async getUserPreferences(userId: string): Promise<NotificationPreferenceResponse> {
    let preferences = await this.repository.findPreferencesByUserId(userId);
    if (!preferences) {
      preferences = await this.repository.createDefaultPreferences(userId);
    }
    return sanitizeNotificationPreferenceResponse(preferences);
  }

  public async updateUserPreferences(
    userId: string,
    input: UpdateNotificationPreferenceInput
  ): Promise<NotificationPreferenceResponse> {
    const updated = await this.repository.updatePreferencesByUserId(userId, input);
    return sanitizeNotificationPreferenceResponse(updated);
  }

  private isNotificationTypeEnabled(type: string, preferences: any): boolean {
    switch (type) {
      case "CLIENT":
        return preferences.clientEnabled ?? true;
      case "PROJECT":
        return preferences.projectEnabled ?? true;
      case "PAYMENT":
        return preferences.paymentEnabled ?? true;
      case "SYSTEM":
        return preferences.systemEnabled ?? true;
      case "APPLICATION":
      case "MEMBER":
        return preferences.announcementEnabled ?? true;
      default:
        return true;
    }
  }
}
