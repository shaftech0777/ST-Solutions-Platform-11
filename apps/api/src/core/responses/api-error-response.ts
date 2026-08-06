import { createResponseMeta } from "./api-response.js";
import { DEFAULT_ERROR_MESSAGES, HTTP_STATUS_CODES } from "./response.constants.js";
import { ApiErrorResponse, ErrorResponseOptions, ValidationErrorDetail } from "./response.types.js";

/**
 * Constructs a strongly typed ApiErrorResponse payload.
 *
 * @param options Configuration object defining error structure and metadata
 * @returns Standardized ApiErrorResponse object
 */
export function createErrorResponse(options: ErrorResponseOptions): ApiErrorResponse {
  const statusCode = options.statusCode ?? HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  const error = options.error ?? "InternalServerError";
  const message = options.message ?? DEFAULT_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  const meta = createResponseMeta(options.requestId);

  const response: {
    success: false;
    statusCode: number;
    error: string;
    message: string;
    meta: ReturnType<typeof createResponseMeta>;
    details?: readonly ValidationErrorDetail[] | Record<string, unknown>;
  } = {
    success: false,
    statusCode,
    error,
    message,
    meta,
  };

  if (options.details !== undefined) {
    response.details = options.details;
  }

  return response;
}
