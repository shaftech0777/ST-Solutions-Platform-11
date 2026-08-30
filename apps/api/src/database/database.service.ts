import { prisma } from "./prisma.client.js";
import { DatabaseHealthStatus } from "./database.types.js";
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
      Logger.info("Initializing authoritative PostgreSQL database connection...");
      await prisma.$connect();
      this.isConnected = true;
      Logger.info("Database service ready and connected to PostgreSQL.");
    } catch (error) {
      this.isConnected = false;
      Logger.error({ error }, "Database connection error encountered during initialization.");
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
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
    } catch (error: any) {
      // If the query failed due to a recycled idle pool socket, retry once to allow transparent reconnection
      try {
        await prisma.$queryRaw`SELECT 1`;
        const latencyMs = Date.now() - start;
        return {
          status: "up",
          latencyMs,
        };
      } catch (retryError: any) {
        const latencyMs = Date.now() - start;
        return {
          status: "down",
          latencyMs,
          error: retryError?.message || error?.message || "Database health probe failed",
        };
      }
    }
  }
}

export const databaseService = new DatabaseService();
