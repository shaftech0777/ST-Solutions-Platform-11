import { TransactionClient } from "../database.types.js";
import { prisma } from "../prisma.client.js";
import { handleDatabaseError } from "../database.errors.js";

/**
 * Base Abstract Repository providing shared database client resolution
 * and error handling encapsulation for concrete domain repositories.
 */
export abstract class BaseRepository {
  /**
   * Resolves active database client, prioritizing transaction client if provided,
   * otherwise using primary Prisma Client singleton.
   *
   * @param tx Optional transaction client
   * @returns Active TransactionClient
   */
  protected getClient(tx?: TransactionClient): TransactionClient {
    return (tx ?? prisma) as TransactionClient;
  }

  /**
   * Safely executes database operations, wrapping raw exceptions with normalized AppError handling.
   *
   * @param operation Database access callback
   * @param requestId Optional request correlation ID
   * @returns Result of operation
   */
  protected async execute<R>(operation: () => Promise<R>, requestId?: string): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      throw handleDatabaseError(error, requestId);
    }
  }

  /**
   * Executes a database transaction cleanly wrapped with AppError handling.
   *
   * @param fn Callback receiving transaction client
   * @returns Result of callback
   */
  public async transaction<R>(fn: (tx: TransactionClient) => Promise<R>): Promise<R> {
    return this.execute(async () => {
      return prisma.$transaction(fn, {
        maxWait: 10000,
        timeout: 30000,
      });
    });
  }
}
