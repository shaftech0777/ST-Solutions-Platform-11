import express, { Express, Request, Response } from "express";
import { errorHandler } from "./middlewares/index.js";
import { securityConfig } from "./config/security.js";

const app: Express = express();

app.use(securityConfig.helmet);
app.use(securityConfig.cors);
app.use(securityConfig.rateLimiter);
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "st-solutions-api", version: "1.0.0" });
});

app.use(errorHandler);

export default app;
