import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { NotificationsService } from "./notifications.service.js";
import { notificationStreamManager } from "./notifications.stream.js";

export class NotificationsController {
  private readonly notificationsService: NotificationsService;

  constructor(notificationsService: NotificationsService) {
    this.notificationsService = notificationsService;
  }

  private getAuthUserId(req: Request): string {
    return (req as any).user?.userId || (req as any).user?.id;
  }

  public streamNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized SSE stream access" });
        return;
      }
      notificationStreamManager.addConnection(userId, res);
    } catch (error) {
      next(error);
    }
  };

  public getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getAuthUserId(req);
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
      const userId = this.getAuthUserId(req);
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
      const userId = this.getAuthUserId(req);
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
      const userId = this.getAuthUserId(req);
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
      const userId = this.getAuthUserId(req);
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
      const userId = this.getAuthUserId(req);
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
      const userId = this.getAuthUserId(req);
      const input = req.body;
      const result = await this.notificationsService.updateUserPreferences(userId, input);

      ResponseBuilder.success(res, result, {
        message: "Notification preferences updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const notices = await this.notificationsService.getNotices(user ? { userId: user.userId || user.id, accountType: user.accountType } : undefined);
      ResponseBuilder.success(res, notices, {
        message: "Administrative notices retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const notices = await this.notificationsService.getAllNotices(user ? { userId: user.userId || user.id, accountType: user.accountType } : undefined);
      ResponseBuilder.success(res, notices, {
        message: "All administrative notices retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public createNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const notice = await this.notificationsService.createNotice(req.body, { userId: user.userId || user.id, accountType: user.accountType });
      ResponseBuilder.created(res, notice, {
        message: "Administrative notice created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public updateNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const notice = await this.notificationsService.updateNotice(id, req.body, { userId: user.userId || user.id, accountType: user.accountType });
      ResponseBuilder.success(res, notice, {
        message: "Administrative notice updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      await this.notificationsService.deleteNotice(id, { userId: user.userId || user.id, accountType: user.accountType });
      ResponseBuilder.success(res, null, {
        message: "Administrative notice deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

