import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import apiApp from "./apps/api/src/app.js";
import { databaseService } from "./apps/api/src/database/index.js";
import { Logger } from "./apps/api/src/core/logger/index.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxies (Render, Cloud Run, nginx)
  app.set("trust proxy", 1);

  try {
    await databaseService.connect();
    Logger.info("Database service ready.");
  } catch (err) {
    Logger.warn({ err }, "Database startup warning; using embedded data engine.");
  }

  // Mount the API application (handles /health, /api/v1, /auth, security, CORS, context)
  app.use(apiApp);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexPath = path.join(distPath, "index.html");

    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.use((_req: Request, res: Response) => {
        res.sendFile(indexPath);
      });
    } else {
      // Backend-only mode on Render or custom deployment
      app.use((_req: Request, res: Response) => {
        res.status(200).json({
          status: "ok",
          service: "ST-Solutions API",
          version: "1.0.0",
          environment: process.env.NODE_ENV || "production",
          endpoints: {
            health: "/health",
            apiV1: "/api/v1",
            auth: "/auth/login",
          },
          documentation: "Frontend hosted on Vercel connecting via VITE_API_URL",
        });
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    Logger.info(`ST-Solutions Enterprise Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
