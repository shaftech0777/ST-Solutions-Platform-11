import { Request, Response, NextFunction } from "express";
import { aiService } from "./ai.service.js";
import { aiQuerySchema } from "./ai.validation.js";

export class AiController {
  public async query(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = aiQuerySchema.parse(req.body);
      const userId = (req as any).user?.userId || "anonymous";
      const result = await aiService.query(userId, validated);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AiController();
