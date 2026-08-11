import { PrismaClient } from "@prisma/client";
import {
  CreateNotificationInput,
  NotificationQueryFilters,
  UpdateNotificationPreferenceInput,
} from "./notifications.types.js";

export class NotificationsRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  public async createNotification(data: CreateNotificationInput) {
    return this.db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        notificationType: data.notificationType,
        priority: data.priority || "NORMAL",
        actionUrl: data.actionUrl || null,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        metadata: data.metadata ? (data.metadata as any) : undefined,
        status: "UNREAD",
      },
    });
  }

  public async findNotificationById(id: string) {
    return this.db.notification.findUnique({
      where: { id },
    });
  }

  public async findNotificationsByUserId(userId: string, filters: NotificationQueryFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.category) {
      where.notificationType = filters.category;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.status) {
      where.status = filters.status;
    } else if (filters.isRead !== undefined) {
      where.status = filters.isRead ? "READ" : "UNREAD";
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { message: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    return this.db.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  public async countNotificationsByUserId(userId: string, filters: NotificationQueryFilters) {
    const where: any = { userId };

    if (filters.category) {
      where.notificationType = filters.category;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.status) {
      where.status = filters.status;
    } else if (filters.isRead !== undefined) {
      where.status = filters.isRead ? "READ" : "UNREAD";
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { message: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return this.db.notification.count({ where });
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.db.notification.count({
      where: {
        userId,
        status: "UNREAD",
      },
    });
  }

  public async markAsRead(id: string) {
    return this.db.notification.update({
      where: { id },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });
  }

  public async markAsUnread(id: string) {
    return this.db.notification.update({
      where: { id },
      data: {
        status: "UNREAD",
        readAt: null,
      },
    });
  }

  public async markAllAsRead(userId: string) {
    return this.db.notification.updateMany({
      where: {
        userId,
        status: "UNREAD",
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });
  }

  public async findPreferencesByUserId(userId: string) {
    return this.db.notificationPreference.findUnique({
      where: { userId },
    });
  }

  public async createDefaultPreferences(userId: string) {
    return this.db.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        systemEnabled: true,
        clientEnabled: true,
        projectEnabled: true,
        paymentEnabled: true,
        securityEnabled: true,
        announcementEnabled: true,
      },
    });
  }

  public async updatePreferencesByUserId(userId: string, data: UpdateNotificationPreferenceInput) {
    return this.db.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailEnabled: data.emailEnabled ?? true,
        systemEnabled: data.systemEnabled ?? true,
        clientEnabled: data.clientEnabled ?? true,
        projectEnabled: data.projectEnabled ?? true,
        paymentEnabled: data.paymentEnabled ?? true,
        securityEnabled: data.securityEnabled ?? true,
        announcementEnabled: data.announcementEnabled ?? true,
      },
      update: {
        ...data,
      },
    });
  }
}
