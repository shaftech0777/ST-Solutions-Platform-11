import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsRepository } from "./notifications.repository.js";
import { NotificationsService } from "./notifications.service.js";
import {
  notificationIdParamSchema,
  notificationQuerySchema,
  updateNotificationPreferenceSchema,
} from "./notifications.validation.js";
import { container } from "../../core/container/container.js";
import { TOKENS } from "../../core/container/container.tokens.js";

export const notificationsRouter = Router();

// Protect all notification endpoints with authentication
notificationsRouter.use(authenticate());

// Helper to resolve controller from DI container
function getController(): NotificationsController {
  return container.resolve<NotificationsController>(TOKENS.NotificationsController);
}

/**
 * @route GET /api/v1/notifications/stream
 * @desc Server-Sent Events (SSE) stream for real-time notifications
 * @access Protected
 */
notificationsRouter.get(
  "/stream",
  (req, res, next) => getController().streamNotifications(req, res, next)
);

/**
 * @route GET /api/v1/notifications
 * @desc List paginated user notifications with filtering
 * @access Protected
 */
notificationsRouter.get(
  "/",
  requirePermission("notifications.read"),
  validate({ query: notificationQuerySchema }),
  (req, res, next) => getController().getNotifications(req, res, next)
);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Get unread notification count for current user
 * @access Protected
 */
notificationsRouter.get(
  "/unread-count",
  requirePermission("notifications.read"),
  (req, res, next) => getController().getUnreadCount(req, res, next)
);

/**
 * @route GET /api/v1/notifications/preferences
 * @desc Get notification preferences for current user
 * @access Protected
 */
notificationsRouter.get(
  "/preferences",
  requirePermission("notifications.preferences"),
  (req, res, next) => getController().getPreferences(req, res, next)
);

/**
 * @route PATCH /api/v1/notifications/preferences
 * @desc Update notification preferences for current user
 * @access Protected
 */
notificationsRouter.patch(
  "/preferences",
  requirePermission("notifications.preferences"),
  validate({ body: updateNotificationPreferenceSchema }),
  (req, res, next) => getController().updatePreferences(req, res, next)
);

/**
 * @route PATCH /api/v1/notifications/:notificationId/read
 * @desc Mark single notification as read
 * @access Protected
 */
notificationsRouter.patch(
  "/:notificationId/read",
  requirePermission("notifications.manage"),
  validate({ params: notificationIdParamSchema }),
  (req, res, next) => getController().markAsRead(req, res, next)
);

/**
 * @route PATCH /api/v1/notifications/:notificationId/unread
 * @desc Mark single notification as unread
 * @access Protected
 */
notificationsRouter.patch(
  "/:notificationId/unread",
  requirePermission("notifications.manage"),
  validate({ params: notificationIdParamSchema }),
  (req, res, next) => getController().markAsUnread(req, res, next)
);

/**
 * @route POST /api/v1/notifications/read-all
 * @desc Mark all notifications as read for current user
 * @access Protected
 */
notificationsRouter.post(
  "/read-all",
  requirePermission("notifications.manage"),
  (req, res, next) => getController().markAllAsRead(req, res, next)
);

/**
 * @route GET /api/v1/notifications/notices
 * @desc Get administrative notices active for current user
 * @access Protected
 */
notificationsRouter.get(
  "/notices",
  (req, res, next) => getController().getNotices(req, res, next)
);

/**
 * @route GET /api/v1/notifications/notices/all
 * @desc Get all administrative notices (Admin/Sub-Admin)
 * @access Protected
 */
notificationsRouter.get(
  "/notices/all",
  requirePermission("notifications.manage"),
  (req, res, next) => getController().getAllNotices(req, res, next)
);

/**
 * @route POST /api/v1/notifications/notices
 * @desc Create a new administrative notice
 * @access Protected (Admin/Sub-Admin)
 */
notificationsRouter.post(
  "/notices",
  requirePermission("notifications.manage"),
  (req, res, next) => getController().createNotice(req, res, next)
);

/**
 * @route PATCH /api/v1/notifications/notices/:id
 * @desc Update an administrative notice
 * @access Protected (Admin/Sub-Admin)
 */
notificationsRouter.patch(
  "/notices/:id",
  requirePermission("notifications.manage"),
  (req, res, next) => getController().updateNotice(req, res, next)
);

/**
 * @route DELETE /api/v1/notifications/notices/:id
 * @desc Delete an administrative notice
 * @access Protected (Admin/Sub-Admin)
 */
notificationsRouter.delete(
  "/notices/:id",
  requirePermission("notifications.manage"),
  (req, res, next) => getController().deleteNotice(req, res, next)
);

