import express, { Express, Request, Response } from "express";
import { securityConfig } from "./config/security.js";
import {
  globalErrorHandlerMiddleware,
  notFoundHandlerMiddleware,
  requestContextMiddleware,
  requestLoggerMiddleware,
} from "./middlewares/index.js";

const app: Express = express();

// 1. Security Middleware
app.use(securityConfig.helmet);
app.use(securityConfig.cors);
app.use(securityConfig.rateLimiter);

// 2. Request Context Middleware (AsyncLocalStorage & Request ID)
app.use(requestContextMiddleware);

// 3. Request Logger Middleware (Structured Pino HTTP Logging)
app.use(requestLoggerMiddleware);

// 4. Body Parsers
app.use(express.json());

// 5. Routes / Health Check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "st-solutions-api", version: "1.0.0" });
});

// 6. 404 Route Not Found Middleware
app.use(notFoundHandlerMiddleware);

// 7. Global Error Handling Middleware (MUST BE LAST)
app.use(globalErrorHandlerMiddleware);

export default app;
