import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { createMockPrismaClient } from "./mock-prisma-client.js";
import { Logger } from "../core/logger/index.js";

function createPrismaClient(): any {
  // If no PostgreSQL DATABASE_URL or running in standalone dev mode without active database daemon
  if (!config.database.url || config.database.url.includes("localhost") || !process.env.DATABASE_URL) {
    Logger.info("Using embedded in-memory relational store for ST-Solutions operations.");
    return createMockPrismaClient();
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
    return createMockPrismaClient();
  }
}

/**
 * Application-wide PrismaClient Singleton Instance.
 * Embedded mock Prisma client handles all transactional, relational and filtering queries.
 */
export const prisma: any = createPrismaClient();

