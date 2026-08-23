import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiApp from "./apps/api/src/app.js";
import { databaseService } from "./apps/api/src/database/index.js";
import { Logger } from "./apps/api/src/core/logger/index.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    Logger.info(`ST-Solutions Enterprise Platform running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
