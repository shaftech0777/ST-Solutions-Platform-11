import { prisma } from "./prisma.client.js";
import { TransactionClient } from "./database.types.js";
import { handleDatabaseError } from "./database.errors.js";

/**
 * Configuration options for Prisma interactive transactions.
 */
export interface TransactionOptions {
  readonly maxWait?: number;
  readonly timeout?: number;
  readonly requestId?: string;
}

/**
 * Executes a callback within an atomic, isolated Prisma interactive transaction.
 * Automatically rolls back operations if an exception is thrown.
 *
 * @param fn Callback function executing database operations using provided TransactionClient
 * @param options Transaction timeout and isolation configuration
 * @returns Result of execution callback
 */
export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  try {
    return await prisma.$transaction(
      async (tx: any) => {
        return await fn(tx as TransactionClient);
      },
      {
        maxWait: options?.maxWait ?? 5000,
        timeout: options?.timeout ?? 10000,
      }
    );
  } catch (error) {
    throw handleDatabaseError(error, options?.requestId);
  }
}
