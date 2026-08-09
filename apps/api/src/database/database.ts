import { databaseService } from "./database.service.js";

/**
 * Backward-compatible wrapper for database connection initialization.
 */
export async function connectDatabase(): Promise<void> {
  await databaseService.connect();
}

export * from "./database.service.js";
