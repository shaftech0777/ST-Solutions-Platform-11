import { prisma } from "./prisma.js";
import { logger } from "../config/logger.js";

export async function connectDatabase(): Promise<void> {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      logger.info("Database connection initialized via Prisma.");
    } else {
      logger.info("DATABASE_URL not configured; skipping active database connection.");
    }
  } catch (error) {
    logger.warn({ error }, "Database connection attempt failed.");
  }
}
