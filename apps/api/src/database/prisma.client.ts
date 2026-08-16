import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { createMockPrismaClient } from "./mock-prisma-client.js";
import { Logger } from "../core/logger/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

const mockPrisma = createMockPrismaClient();

function createPrismaClient(): any {
  // If no PostgreSQL DATABASE_URL or running in standalone dev mode without active database daemon
  if (!config.database.url || config.database.url.includes("localhost") || !process.env.DATABASE_URL) {
    Logger.info("Using embedded in-memory relational store for ST-Solutions operations.");
    return mockPrisma;
  }

  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
      log: config.database.logQueries ? ["query", "error", "warn"] : ["error"],
    });
    return client;
  } catch (err) {
    Logger.warn({ err }, "PrismaClient initialization fallback to in-memory relational store.");
    return mockPrisma;
  }
}

/**
 * Application-wide PrismaClient Singleton Instance.
 * Prevents multiple client initializations during development and hot-reload.
 */
export const prisma: any = globalForPrisma.prisma ?? createPrismaClient();

if (!config.app.isProduction) {
  globalForPrisma.prisma = prisma;
}

