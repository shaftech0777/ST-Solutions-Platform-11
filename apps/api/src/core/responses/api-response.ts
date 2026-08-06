import { DEFAULT_SUCCESS_MESSAGES, HTTP_STATUS_CODES } from "./response.constants.js";
import { ApiSuccessResponse, ResponseMeta, SuccessResponseOptions } from "./response.types.js";

/**
 * Generates ISO-8601 UTC timestamp and constructs standardized ResponseMeta.
 *
 * @param requestId Optional request correlation ID
 * @returns Standardized ResponseMeta object
 */
export function createResponseMeta(requestId?: string): ResponseMeta {
  const meta: { requestId?: string; timestamp: string } = {
    timestamp: new Date().toISOString(),
  };

  if (requestId !== undefined && requestId !== "") {
    meta.requestId = requestId;
  }

  return meta;
}

/**
 * Constructs a strongly typed ApiSuccessResponse payload.
 *
 * @param data Response payload data
 * @param options Optional overrides for status code, message, and request ID
 * @returns Standardized ApiSuccessResponse object
 */
export function createSuccessResponse<T>(
  data: T,
  options?: SuccessResponseOptions
): ApiSuccessResponse<T> {
  const statusCode = options?.statusCode ?? HTTP_STATUS_CODES.OK;
  const message = options?.message ?? DEFAULT_SUCCESS_MESSAGES.SUCCESS;
  const meta = createResponseMeta(options?.requestId);

  return {
    success: true,
    statusCode,
    message,
    data,
    meta,
  };
}
