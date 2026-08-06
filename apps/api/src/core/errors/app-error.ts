import { config } from "../../config/index.js";
import { RequestContext } from "../context/request-context.js";
import { ValidationErrorDetail } from "../responses/response.types.js";
import { ERROR_CODES, ErrorCode } from "./error.codes.js";
import { AppErrorOptions, SerializedError } from "./error.types.js";

/**
 * Abstract Base Application Error class.
 * All operational exceptions across the ST-Solutions Platform inherit from AppError.
 */
export class AppError extends Error {
  public override readonly name: string;
  public override readonly message: string;
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: readonly ValidationErrorDetail[] | Record<string, unknown>;
  public readonly timestamp: string;
  public readonly requestId?: string;
  public override readonly cause?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = options.name ?? new.target.name ?? "AppError";
    this.message = options.message;
    this.statusCode = options.statusCode ?? 500;
    this.errorCode = options.errorCode ?? ERROR_CODES.SYSTEM_INTERNAL_ERROR;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    this.requestId = options.requestId ?? RequestContext.getRequestId();
    this.cause = options.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  /**
   * Serializes the error instance into a safe structured object.
   * Excludes stack traces when in production.
   */
  public toJSON(includeStack: boolean = !config.app.isProduction): SerializedError {
    const serialized: SerializedError = {
      success: false,
      statusCode: this.statusCode,
      error: this.name,
      errorCode: this.errorCode,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
      timestamp: this.timestamp,
      ...(this.requestId !== undefined && { requestId: this.requestId }),
      ...(includeStack && this.stack !== undefined && { stack: this.stack }),
    };

    return serialized;
  }
}

/**
 * Thrown when Zod input validation or sanitization fails (HTTP 422).
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Input validation failed for the provided request",
    details?: readonly ValidationErrorDetail[] | Record<string, unknown>,
    requestId?: string
  ) {
    super({
      name: "ValidationError",
      message,
      statusCode: 422,
      errorCode: ERROR_CODES.VALIDATION_FAILED,
      isOperational: true,
      details,
      requestId,
    });
  }
}

/**
 * Thrown when JWT token is missing, invalid, expired, or authentication fails (HTTP 401).
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required or invalid credentials",
    errorCode: ErrorCode | string = ERROR_CODES.AUTH_UNAUTHORIZED,
    requestId?: string
  ) {
    super({
      name: "AuthenticationError",
      message,
      statusCode: 401,
      errorCode,
      isOperational: true,
      requestId,
    });
  }
}

/**
 * Thrown when an authenticated user lacks required role or privileges (HTTP 403).
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Insufficient permissions to perform this action",
    errorCode: ErrorCode | string = ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS,
    requestId?: string
  ) {
    super({
      name: "AuthorizationError",
      message,
      statusCode: 403,
      errorCode,
      isOperational: true,
      requestId,
    });
  }
}

/**
 * Thrown when a requested resource or record does not exist (HTTP 404).
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Requested resource was not found",
    errorCode: ErrorCode | string = ERROR_CODES.SYSTEM_NOT_FOUND,
    requestId?: string
  ) {
    super({
      name: "NotFoundError",
      message,
      statusCode: 404,
      errorCode,
      isOperational: true,
      requestId,
    });
  }
}

/**
 * Thrown when a record state conflict or unique constraint violation occurs (HTTP 409).
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource state conflict detected",
    errorCode: ErrorCode | string = ERROR_CODES.CONFLICT_RECORD_EXISTS,
    requestId?: string
  ) {
    super({
      name: "ConflictError",
      message,
      statusCode: 409,
      errorCode,
      isOperational: true,
      requestId,
    });
  }
}

/**
 * Thrown when domain business rules are violated (HTTP 400).
 */
export class BusinessError extends AppError {
  constructor(
    message: string = "Business rule violation occurred",
    errorCode: ErrorCode | string = ERROR_CODES.BUSINESS_RULE_VIOLATION,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super({
      name: "BusinessError",
      message,
      statusCode: 400,
      errorCode,
      isOperational: true,
      details,
      requestId,
    });
  }
}

/**
 * Wraps internal database errors to prevent raw SQL/Prisma exposure (HTTP 500).
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "A database operation failed",
    cause?: unknown,
    requestId?: string
  ) {
    super({
      name: "DatabaseError",
      message,
      statusCode: 500,
      errorCode: ERROR_CODES.DATABASE_QUERY_ERROR,
      isOperational: true,
      cause,
      requestId,
    });
  }
}

/**
 * Catch-all error for unhandled exceptions or unexpected system faults (HTTP 500).
 */
export class UnknownError extends AppError {
  constructor(
    message: string = "An unexpected internal server error occurred",
    cause?: unknown,
    requestId?: string
  ) {
    super({
      name: "UnknownError",
      message,
      statusCode: 500,
      errorCode: ERROR_CODES.SYSTEM_INTERNAL_ERROR,
      isOperational: false,
      cause,
      requestId,
    });
  }
}
