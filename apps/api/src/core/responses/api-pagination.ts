import { createResponseMeta } from "./api-response.js";
import { DEFAULT_SUCCESS_MESSAGES, HTTP_STATUS_CODES } from "./response.constants.js";
import {
  PaginatedResponse,
  PaginationMeta,
  PaginationParams,
  SuccessResponseOptions,
} from "./response.types.js";

/**
 * Calculates pagination metadata given input pagination parameters.
 *
 * @param params Object containing page, limit, and totalRecords
 * @returns Enterprise PaginationMeta object conforming strictly to contract
 */
export function createPaginationMeta(params: PaginationParams): PaginationMeta {
  const page = Math.max(1, Math.floor(params.page || 1));
  const limit = Math.max(1, Math.floor(params.limit || 10));
  const totalRecords = Math.max(0, Math.floor(params.totalRecords || 0));

  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    totalItems: totalRecords,
  };
}

/**
 * Constructs a strongly typed PaginatedResponse payload.
 *
 * @param data Array of retrieved entities
 * @param paginationParams Pagination parameters (page, limit, totalRecords)
 * @param options Optional overrides for status code, message, and request ID
 * @returns Standardized PaginatedResponse object
 */
export function createPaginatedResponse<T>(
  data: readonly T[],
  paginationParams: PaginationParams,
  options?: SuccessResponseOptions
): PaginatedResponse<T> {
  const statusCode = options?.statusCode ?? HTTP_STATUS_CODES.OK;
  const message = options?.message ?? DEFAULT_SUCCESS_MESSAGES.SUCCESS;
  const pagination = createPaginationMeta(paginationParams);
  const meta = createResponseMeta(options?.requestId);

  return {
    success: true,
    statusCode,
    message,
    data,
    pagination,
    meta,
  };
}
