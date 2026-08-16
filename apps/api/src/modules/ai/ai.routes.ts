import { Router } from "express";
import { aiController } from "./ai.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

export const aiRouter = Router();

aiRouter.post("/query", authenticate(), (req, res, next) => aiController.query(req, res, next));
