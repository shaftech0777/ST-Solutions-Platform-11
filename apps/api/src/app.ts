import express, { Express, Request, Response } from "express";
import { securityConfig } from "./config/security.js";
import { databaseService } from "./database/index.js";
import "./core/container/container.js";
import { apiRouter } from "./routes/api.router.js";
import { authRouter } from "./modules/auth/index.js";
import {
  globalErrorHandlerMiddleware,
  notFoundHandlerMiddleware,
  requestContextMiddleware,
  requestLoggerMiddleware,
} from "./middlewares/index.js";

const app: Express = express();

// Trust proxy for reverse proxies (nginx, Cloud Run)
app.set("trust proxy", 1);

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
const healthHandler = async (_req: Request, res: Response) => {
  const dbHealth = await databaseService.healthCheck();
  const isHealthy = dbHealth.status === "up";
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    database: isHealthy ? "connected" : "disconnected",
    latencyMs: dbHealth.latencyMs,
    ...(isHealthy ? {} : { error: dbHealth.error }),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);
app.get("/api/v1/health", healthHandler);

// Mount API routers
app.use("/api/v1", apiRouter);
app.use("/auth", authRouter); // Direct access for /auth/login, /auth/register, etc.
app.use("/api/auth", authRouter); // Alias for /api/auth/login

// 6. 404 Route Not Found Middleware (scoped to API routes)
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
    return notFoundHandlerMiddleware(req, res, next);
  }
  next();
});

// 7. Global Error Handling Middleware (MUST BE LAST)
app.use(globalErrorHandlerMiddleware);

export default app;

