import app from "./app.js";
import { config } from "./config/index.js";
import { databaseService } from "./database/index.js";
import { Logger } from "./core/logger/index.js";

const port = config.port;

async function bootstrap(): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";

  // Authoritative PostgreSQL Database Verification
  try {
    Logger.info(`Connecting to database service [Environment: ${config.app.env}]...`);
    await databaseService.connect();
    
    // Safely initialize missing CMS content
    const { initializeCMSSections } = await import("./modules/settings/settings.init.js");
    await initializeCMSSections();

    
    // Execute live probe query (SELECT 1)
    const health = await databaseService.healthCheck();
    if (isProduction && health.status !== "up") {
      Logger.error({ error: health.error }, "FATAL: PostgreSQL production database probe (SELECT 1) failed. Aborting startup.");
      process.exit(1);
    }
    Logger.info(`Database service verified healthy (latency: ${health.latencyMs}ms).`);
  } catch (err: any) {
    if (isProduction) {
      Logger.error({ error: err?.message || err }, "FATAL: Failed to connect to authoritative PostgreSQL database in production. Aborting startup.");
      process.exit(1);
    } else {
      Logger.warn("Starting development/test server with embedded data store fallback.");
    }
  }

  const server = app.listen(port, () => {
    Logger.info(`ST-Solutions API running on port ${port} [${config.app.env}]`);
  });

  // Graceful Shutdown Handler
  const handleShutdown = async (signal: string): Promise<void> => {
    Logger.info(`Received ${signal}. Initiating graceful shutdown sequence...`);

    server.close(async () => {
      Logger.info("HTTP server closed.");
      await databaseService.disconnect();
      Logger.info("Database connection closed. Graceful shutdown complete.");
      process.exit(0);
    });

    // Forced exit fallback if cleanup hangs
    setTimeout(() => {
      Logger.error("Forced shutdown triggered due to cleanup timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => void handleShutdown("SIGTERM"));
  process.on("SIGINT", () => void handleShutdown("SIGINT"));
}

void bootstrap();

export default app;
