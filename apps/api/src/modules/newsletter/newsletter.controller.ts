import { Request, Response } from "express";
import { newsletterService } from "./newsletter.service.js";

export class NewsletterController {
  public async subscribe(req: Request, res: Response): Promise<void> {
    const { email, source } = req.body;
    const result = await newsletterService.subscribe(email, source);

    res.status(200).json({
      success: true,
      message: "Subscribed successfully to updates.",
      data: result,
    });
  }

  public async list(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const result = await newsletterService.getSubscribers(page, limit);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }
}

export const newsletterController = new NewsletterController();
