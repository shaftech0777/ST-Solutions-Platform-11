import { NotificationPriority, NotificationStatus, NotificationType } from "@prisma/client";

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  readAt: Date | null;
}

export interface NotificationPreferenceResponse {
  id: string;
  userId: string;
  emailEnabled: boolean;
  systemEnabled: boolean;
  clientEnabled: boolean;
  projectEnabled: boolean;
  paymentEnabled: boolean;
  securityEnabled: boolean;
  announcementEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
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

export interface UpdateNotificationPreferenceInput {
  emailEnabled?: boolean;
  systemEnabled?: boolean;
  clientEnabled?: boolean;
  projectEnabled?: boolean;
  paymentEnabled?: boolean;
  securityEnabled?: boolean;
  announcementEnabled?: boolean;
}

export interface NotificationQueryFilters {
  page?: number;
  limit?: number;
  category?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  isRead?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

export interface UnreadCountResponse {
  unreadCount: number;
}
