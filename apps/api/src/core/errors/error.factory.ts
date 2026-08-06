import { ValidationErrorDetail } from "../responses/response.types.js";
import {
  AuthenticationError,
  AuthorizationError,
  BusinessError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  UnknownError,
  ValidationError,
} from "./app-error.js";
import { ERROR_CODES, ErrorCode } from "./error.codes.js";

/**
 * Enterprise Error Factory producing strongly typed AppError instances.
 */
export class ErrorFactory {
  /**
   * Creates a ValidationError instance (HTTP 422).
   */
  public static createValidationError(
    message?: string,
    details?: readonly ValidationErrorDetail[] | Record<string, unknown>,
    requestId?: string
  ): ValidationError {
    return new ValidationError(message, details, requestId);
  }

  /**
   * Creates an AuthenticationError instance (HTTP 401).
   */
  public static createAuthenticationError(
    message?: string,
    errorCode: ErrorCode | string = ERROR_CODES.AUTH_UNAUTHORIZED,
    requestId?: string
  ): AuthenticationError {
    return new AuthenticationError(message, errorCode, requestId);
  }

  /**
   * Creates an AuthorizationError instance (HTTP 403).
   */
  public static createAuthorizationError(
    message?: string,
    errorCode: ErrorCode | string = ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS,
    requestId?: string
  ): AuthorizationError {
    return new AuthorizationError(message, errorCode, requestId);
  }

  /**
   * Creates a NotFoundError instance (HTTP 404).
   */
  public static createNotFoundError(
    resourceName: string = "Resource",
    resourceId?: string,
    requestId?: string
  ): NotFoundError {
    const message = resourceId !== undefined
      ? `${resourceName} with ID '${resourceId}' was not found`
      : `${resourceName} was not found`;

    return new NotFoundError(message, ERROR_CODES.SYSTEM_NOT_FOUND, requestId);
  }

  /**
   * Creates a ConflictError instance (HTTP 409).
   */
  public static createConflictError(
    message?: string,
    errorCode: ErrorCode | string = ERROR_CODES.CONFLICT_RECORD_EXISTS,
    requestId?: string
  ): ConflictError {
    return new ConflictError(message, errorCode, requestId);
  }

  /**
   * Creates a BusinessError instance (HTTP 400).
   */
  public static createBusinessError(
    message?: string,
    errorCode: ErrorCode | string = ERROR_CODES.BUSINESS_RULE_VIOLATION,
    details?: Record<string, unknown>,
    requestId?: string
  ): BusinessError {
    return new BusinessError(message, errorCode, details, requestId);
  }

  /**
   * Creates a DatabaseError instance (HTTP 500).
   */
  public static createDatabaseError(
    message?: string,
    cause?: unknown,
    requestId?: string
  ): DatabaseError {
    return new DatabaseError(message, cause, requestId);
  }

  /**
   * Creates an UnknownError instance (HTTP 500).
   */
  public static createUnknownError(
    message?: string,
    cause?: unknown,
    requestId?: string
  ): UnknownError {
    return new UnknownError(message, cause, requestId);
  }
}
