import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { NotificationsService } from "./notifications.service.js";

export class NotificationsController {
  private readonly notificationsService: NotificationsService;

  constructor(notificationsService: NotificationsService) {
    this.notificationsService = notificationsService;
  }

  public getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const filters = req.query as any;
      const result = await this.notificationsService.getUserNotifications(userId, filters);

      ResponseBuilder.paginated(res, result.data, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalRecords: result.pagination.total,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const result = await this.notificationsService.getUnreadCount(userId);

      ResponseBuilder.success(res, result, {
        message: "Unread count retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { notificationId } = req.params;
      const result = await this.notificationsService.markAsRead(notificationId, userId);

      ResponseBuilder.success(res, result, {
        message: "Notification marked as read successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsUnread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { notificationId } = req.params;
      const result = await this.notificationsService.markAsUnread(notificationId, userId);

      ResponseBuilder.success(res, result, {
        message: "Notification marked as unread successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const result = await this.notificationsService.markAllAsRead(userId);

      ResponseBuilder.success(res, result, {
        message: "All notifications marked as read successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const result = await this.notificationsService.getUserPreferences(userId);

      ResponseBuilder.success(res, result, {
        message: "Notification preferences retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const input = req.body;
      const result = await this.notificationsService.updateUserPreferences(userId, input);

      ResponseBuilder.success(res, result, {
        message: "Notification preferences updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
