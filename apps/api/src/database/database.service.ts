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
      Logger.info("Establishing database connection via Prisma Client...");
      await prisma.$connect();
      this.isConnected = true;
      Logger.info("Database connection initialized successfully.");
    } catch (error) {
      this.isConnected = false;
      Logger.error({ error }, "Database connection attempt failed.");
      throw handleDatabaseError(error);
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
    } catch (error) {
      const latencyMs = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : "Database ping failed";
      Logger.warn({ error }, "Database health check failed.");
      return {
        status: "down",
        latencyMs,
        message: errorMessage,
      };
    }
  }
}

export const databaseService = new DatabaseService();
