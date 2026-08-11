import { NotificationPriority, NotificationStatus, NotificationType } from "@prisma/client";
import { z } from "zod";

export const notificationIdParamSchema = z.object({
  notificationId: z.string().uuid("Invalid notification ID format"),
});

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.nativeEnum(NotificationType).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  isRead: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "priority", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateNotificationPreferenceSchema = z.object({
  emailEnabled: z.boolean().optional(),
  systemEnabled: z.boolean().optional(),
  clientEnabled: z.boolean().optional(),
  projectEnabled: z.boolean().optional(),
  paymentEnabled: z.boolean().optional(),
  securityEnabled: z.boolean().optional(),
  announcementEnabled: z.boolean().optional(),
});

export type NotificationIdParamInput = z.infer<typeof notificationIdParamSchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
export type UpdateNotificationPreferenceInputSchema = z.infer<typeof updateNotificationPreferenceSchema>;
