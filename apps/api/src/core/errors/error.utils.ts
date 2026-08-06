import { config } from "../../config/index.js";
import { ApiErrorResponse, ValidationErrorDetail } from "../responses/response.types.js";
import { AppError, ConflictError, DatabaseError, NotFoundError, UnknownError, ValidationError } from "./app-error.js";
import { ERROR_CODES } from "./error.codes.js";

/**
 * Type guard checking if an unknown thrown value is an instance of AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError || (
    typeof error === "object" &&
    error !== null &&
    "isOperational" in error &&
    "statusCode" in error &&
    "errorCode" in error
  );
}

/**
 * Interface representing duck-typed Zod Issue.
 */
interface GenericZodIssue {
  readonly path: readonly (string | number)[];
  readonly message: string;
}

/**
 * Interface representing duck-typed Zod Error.
 */
interface GenericZodError {
  readonly name: string;
  readonly errors?: readonly GenericZodIssue[];
  readonly issues?: readonly GenericZodIssue[];
}

/**
 * Interface representing duck-typed Prisma Known Request Error.
 */
interface GenericPrismaError {
  readonly code?: string;
  readonly meta?: Record<string, unknown>;
  readonly message?: string;
}

/**
 * Normalizes any caught unknown exception into a typed AppError instance.
 * Automatically inspects Zod, Prisma, and standard JavaScript Error objects.
 *
 * @param error Uncaught exception
 * @param requestId Optional correlation request ID
 * @returns Strongly typed AppError instance
 */
export function normalizeError(error: unknown, requestId?: string): AppError {
  // 1. Already an AppError
  if (isAppError(error)) {
    if (requestId !== undefined && error.requestId === undefined) {
      return new (error.constructor as new (options: unknown) => AppError)({
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        isOperational: error.isOperational,
        details: error.details,
        cause: error.cause,
        requestId,
      });
    }
    return error;
  }

  // 2. Duck-type check for Zod Error
  if (
    typeof error === "object" &&
    error !== null &&
    ("issues" in error || "errors" in error) &&
    ("name" in error && (error as GenericZodError).name === "ZodError")
  ) {
    const zodErr = error as GenericZodError;
    const rawIssues = zodErr.issues ?? zodErr.errors ?? [];
    const details: ValidationErrorDetail[] = rawIssues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }));

    return new ValidationError(
      "Input validation failed for the provided request",
      details,
      requestId
    );
  }

  // 3. Duck-type check for Prisma Error
  if (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || (error as { name?: string }).name?.includes("Prisma"))
  ) {
    const prismaErr = error as GenericPrismaError;
    const code = prismaErr.code;

    if (code === "P2002") {
      const target = Array.isArray(prismaErr.meta?.target)
        ? (prismaErr.meta?.target as string[]).join(", ")
        : "field";
      return new ConflictError(
        `A record with matching unique constraint (${target}) already exists`,
        ERROR_CODES.CONFLICT_RECORD_EXISTS,
        requestId
      );
    }

    if (code === "P2025") {
      return new NotFoundError(
        "Requested record was not found in the database",
        ERROR_CODES.DATABASE_RECORD_NOT_FOUND,
        requestId
      );
    }

    if (code === "P2003") {
      return new ConflictError(
        "Foreign key constraint failed on the database operation",
        ERROR_CODES.DATABASE_CONSTRAINT_VIOLATION,
        requestId
      );
    }

    return new DatabaseError(
      "A database constraint or execution error occurred",
      error,
      requestId
    );
  }

  // 4. Standard Error instance
  if (error instanceof Error) {
    return new UnknownError(error.message, error, requestId);
  }

  // 5. Primitive or string throws
  const message = typeof error === "string" ? error : "An unexpected internal server error occurred";
  return new UnknownError(message, error, requestId);
}

/**
 * Sanitizes an error object for logging or client serialization.
 * Strips sensitive environment variables, internal tokens, and stack traces in production.
 *
 * @param error Normalized AppError or unknown error
 * @returns Cleaned error representation object
 */
export function sanitizeError(error: unknown): Record<string, unknown> {
  const normalized = normalizeError(error);
  const isProd = config.app.isProduction;

  return {
    name: normalized.name,
    message: normalized.message,
    statusCode: normalized.statusCode,
    errorCode: normalized.errorCode,
    isOperational: normalized.isOperational,
    timestamp: normalized.timestamp,
    ...(normalized.requestId !== undefined && { requestId: normalized.requestId }),
    ...(normalized.details !== undefined && { details: normalized.details }),
    ...(!isProd && normalized.stack !== undefined && { stack: normalized.stack }),
  };
}

/**
 * Helper generating an ApiErrorResponse object directly from an error.
 *
 * @param error Exception to transform
 * @param requestId Optional request correlation ID
 * @returns ApiErrorResponse structure
 */
export function getErrorResponse(error: unknown, requestId?: string): ApiErrorResponse {
  const normalized = normalizeError(error, requestId);
  return {
    success: false,
    statusCode: normalized.statusCode,
    error: normalized.name,
    message: normalized.message,
    ...(normalized.details !== undefined && { details: normalized.details }),
    meta: {
      timestamp: normalized.timestamp,
      ...(normalized.requestId !== undefined && { requestId: normalized.requestId }),
    },
  };
}
