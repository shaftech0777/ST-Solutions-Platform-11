import app from "./app.js";
import { config } from "./config/index.js";
import { databaseService } from "./database/index.js";
import { Logger } from "./core/logger/index.js";

const port = config.port;

async function bootstrap(): Promise<void> {
  // Connect to database
  try {
    await databaseService.connect();
  } catch {
    Logger.warn("Starting server with unestablished database connection.");
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
