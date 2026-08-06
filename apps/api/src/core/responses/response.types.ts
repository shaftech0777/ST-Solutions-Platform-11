import { HttpStatusCode } from "./response.constants.js";

/**
 * Standard Response Metadata present on every API response.
 */
export interface ResponseMeta {
  readonly requestId?: string;
  readonly timestamp: string;
}

/**
 * Individual field-level validation error detail.
 */
export interface ValidationErrorDetail {
  readonly field: string;
  readonly message: string;
}

/**
 * Pagination metadata schema as defined in the Backend Implementation Contract Section 6.2.
 */
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly totalRecords: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  /** Optional compatibility field matching totalRecords */
  readonly totalItems?: number;
}

/**
 * Input parameters required to calculate PaginationMeta.
 */
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly totalRecords: number;
}

/**
 * Standard API Success Response payload wrapper.
 */
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;
  readonly meta: ResponseMeta;
}

/**
 * Standard API Paginated Success Response payload wrapper.
 */
export interface PaginatedResponse<T> {
  readonly success: true;
  readonly statusCode: number;
  readonly message: string;
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
  readonly meta: ResponseMeta;
}

/**
 * Standard API Error Response payload wrapper.
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
  readonly details?: readonly ValidationErrorDetail[] | Record<string, unknown>;
  readonly meta: ResponseMeta;
}

/**
 * Unified API Response type covering all possible API payload structures.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | PaginatedResponse<T> | ApiErrorResponse;

/**
 * Options configuration for building success responses.
 */
export interface SuccessResponseOptions {
  readonly statusCode?: HttpStatusCode | number;
  readonly message?: string;
  readonly requestId?: string;
}

/**
 * Options configuration for building error responses.
 */
export interface ErrorResponseOptions {
  readonly statusCode: HttpStatusCode | number;
  readonly error: string;
  readonly message: string;
  readonly details?: readonly ValidationErrorDetail[] | Record<string, unknown>;
  readonly requestId?: string;
}
