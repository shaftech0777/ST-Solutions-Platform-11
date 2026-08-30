import { PrismaClient } from "@prisma/client";

/**
 * Type alias for Prisma Interactive Transaction Client.
 */
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Common options for database operations, supporting optional transaction context and request tracing.
 */
export interface DatabaseOperationOptions {
  readonly tx?: TransactionClient;
  readonly requestId?: string;
}

/**
 * Standard input pagination parameters.
 */
export interface PaginationInput {
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Normalized pagination calculation parameters for database queries.
 */
export interface NormalizedPagination {
  readonly page: number;
  readonly limit: number;
  readonly skip: number;
}

/**
 * Generic Paginated Database Query Result metadata & data container.
 */
export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly totalRecords: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
}

/**
 * Database health check status information.
 */
export interface DatabaseHealthStatus {
  readonly status: "up" | "down";
  readonly latencyMs: number;
  readonly message?: string;
  readonly error?: string;
  readonly details?: Record<string, unknown>;
}
