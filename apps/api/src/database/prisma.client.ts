import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a new PrismaClient instance configured with log levels derived from central configuration.
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: config.database.url,
      },
    },
    log: config.database.logQueries ? ["query", "error", "warn"] : ["error"],
  });
}

/**
 * Application-wide PrismaClient Singleton Instance.
 * Prevents multiple client initializations during development and hot-reload.
 */
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (!config.app.isProduction) {
  globalForPrisma.prisma = prisma;
}
