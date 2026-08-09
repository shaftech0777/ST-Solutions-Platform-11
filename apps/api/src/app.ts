import express, { Express, Request, Response } from "express";
import { securityConfig } from "./config/security.js";
import { databaseService } from "./database/index.js";
import { apiRouter } from "./routes/api.router.js";
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
app.get("/health", async (_req: Request, res: Response) => {
  const dbHealth = await databaseService.healthCheck();
  const isHealthy = dbHealth.status === "up";
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    service: "st-solutions-api",
    version: "1.0.0",
    database: dbHealth,
  });
});

app.use("/api/v1", apiRouter);
app.use("/auth", apiRouter); // Alias for top-level /auth/login access

// 6. 404 Route Not Found Middleware
app.use(notFoundHandlerMiddleware);

// 7. Global Error Handling Middleware (MUST BE LAST)
app.use(globalErrorHandlerMiddleware);

export default app;
