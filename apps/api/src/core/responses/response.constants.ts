/**
 * HTTP Status Codes used across the ST-Solutions Platform.
 */
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS_CODES)[keyof typeof HTTP_STATUS_CODES];

/**
 * Default HTTP Success Messages.
 */
export const DEFAULT_SUCCESS_MESSAGES = {
  SUCCESS: "Operation completed successfully",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  ACCEPTED: "Request accepted for processing",
  NO_CONTENT: "No content available",
} as const;

/**
 * Standardized Error Names aligned with AppError taxonomy.
 */
export const ERROR_NAMES = {
  BAD_REQUEST_ERROR: "BadRequestError",
  AUTHENTICATION_ERROR: "AuthenticationError",
  AUTHORIZATION_ERROR: "AuthorizationError",
  NOT_FOUND_ERROR: "NotFoundError",
  CONFLICT_ERROR: "ConflictError",
  VALIDATION_ERROR: "ValidationError",
  BUSINESS_ERROR: "BusinessError",
  DATABASE_ERROR: "DatabaseError",
  INTERNAL_SERVER_ERROR: "InternalServerError",
  UNKNOWN_ERROR: "UnknownError",
} as const;

export type ErrorName = (typeof ERROR_NAMES)[keyof typeof ERROR_NAMES];

/**
 * Default HTTP Error Messages.
 */
export const DEFAULT_ERROR_MESSAGES = {
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Authentication required or invalid credentials",
  FORBIDDEN: "Insufficient permissions to perform this action",
  NOT_FOUND: "Requested resource was not found",
  CONFLICT: "Resource state conflict detected",
  VALIDATION: "Input validation failed for the provided request",
  INTERNAL_SERVER_ERROR: "An unexpected internal server error occurred",
} as const;
