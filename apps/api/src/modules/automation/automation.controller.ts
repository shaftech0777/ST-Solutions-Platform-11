import { Request, Response } from "express";
import { automationService } from "./automation.service.js";

export class AutomationController {
  /**
   * Inbound webhook callback endpoint for n8n to report delivery confirmations and provider message IDs.
   */
  public async handleCallback(req: Request, res: Response): Promise<void> {
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const result = await automationService.processCallback(req.body, req.headers, rawBody);

    if (!result.success) {
      res.status(401).json({
        success: false,
        error: {
          code: "CALLBACK_VERIFICATION_FAILED",
          message: result.message,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: result.message,
      },
    });
  }

  /**
   * Retrieves automation engine telemetry and configuration for admins.
   */
  public async getStatus(_req: Request, res: Response): Promise<void> {
    const status = await automationService.getSystemStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  }

  /**
   * Retrieves paginated automation execution logs for auditing.
   */
  public async getLogs(req: Request, res: Response): Promise<void> {
    const event = req.query.event as string | undefined;
    const status = req.query.status as any | undefined;
    const recipient = req.query.recipient as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await automationService.getLogs({
      event,
      status,
      recipient,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  /**
   * Triggers a live test event from the admin console to verify n8n webhook connectivity.
   */
  public async sendTest(req: Request, res: Response): Promise<void> {
    const recipientEmail = req.body?.recipientEmail || req.body?.email;
    const result = await automationService.sendTestEvent(recipientEmail);

    res.status(200).json({
      success: true,
      data: {
        message: "Test automation event dispatched.",
        result,
      },
    });
  }
}

export const automationController = new AutomationController();
