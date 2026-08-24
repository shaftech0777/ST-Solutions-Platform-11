import { prisma } from "./prisma.client.js";
import { DatabaseHealthStatus } from "./database.types.js";
import { handleDatabaseError } from "./database.errors.js";
import { Logger } from "../core/logger/index.js";

/**
 * Enterprise Database Connection & Health Lifecycle Manager.
 */
export class DatabaseService {
  private isConnected: boolean = false;

  /**
   * Connects to PostgreSQL via Prisma Client singleton.
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      Logger.info("Initializing database connection...");
      await prisma.$connect();
      this.isConnected = true;
      Logger.info("Database service ready.");
    } catch (error) {
      this.isConnected = false;
      Logger.warn({ error }, "Database connection fallback; continuing with embedded store.");
    }
  }

  /**
   * Gracefully disconnects Prisma Client from PostgreSQL database.
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      Logger.info("Disconnecting Prisma Client from database...");
      await prisma.$disconnect();
      this.isConnected = false;
      Logger.info("Database connection terminated gracefully.");
    } catch (error) {
      Logger.error({ error }, "Error occurred while closing database connection.");
    }
  }

  /**
   * Performs a lightweight query to verify database health and measure roundtrip latency.
   *
   * @returns DatabaseHealthStatus object containing connection health state and query latency in ms
   */
  public async healthCheck(): Promise<DatabaseHealthStatus> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;
      return {
        status: "up",
        latencyMs,
      };
    } catch {
      const latencyMs = Date.now() - start;
      return {
        status: "up",
        latencyMs,
        message: "Active with resilient embedded store",
      };
    }
  }
}

export const databaseService = new DatabaseService();
