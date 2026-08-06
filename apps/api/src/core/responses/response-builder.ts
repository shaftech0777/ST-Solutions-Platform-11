import { Response } from "express";
import { createErrorResponse } from "./api-error-response.js";
import { createPaginatedResponse } from "./api-pagination.js";
import { createSuccessResponse } from "./api-response.js";
import {
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_SUCCESS_MESSAGES,
  ERROR_NAMES,
  HTTP_STATUS_CODES,
  HttpStatusCode,
} from "./response.constants.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationParams,
  ValidationErrorDetail,
} from "./response.types.js";

/**
 * Enterprise Response Builder class providing static helper methods for creating
 * and dispatching standardized API responses across all controllers.
 */
export class ResponseBuilder {
  // ==========================================
  // SUCCESS RESPONSE BUILDERS
  // ==========================================

  /**
   * Builds and optionally dispatches an HTTP 200 OK success response.
   */
  public static success<T>(
    res: Response | null,
    data: T,
    options?: { statusCode?: HttpStatusCode; message?: string; requestId?: string }
  ): Response | ApiSuccessResponse<T> {
    const responsePayload = createSuccessResponse(data, {
      statusCode: options?.statusCode ?? HTTP_STATUS_CODES.OK,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGES.SUCCESS,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 201 Created success response.
   */
  public static created<T>(
    res: Response | null,
    data: T,
    options?: { message?: string; requestId?: string }
  ): Response | ApiSuccessResponse<T> {
    return ResponseBuilder.success(res, data, {
      statusCode: HTTP_STATUS_CODES.CREATED,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGES.CREATED,
      requestId: options?.requestId,
    });
  }

  /**
   * Builds and optionally dispatches an HTTP 200 OK updated success response.
   */
  public static updated<T>(
    res: Response | null,
    data: T,
    options?: { message?: string; requestId?: string }
  ): Response | ApiSuccessResponse<T> {
    return ResponseBuilder.success(res, data, {
      statusCode: HTTP_STATUS_CODES.OK,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGES.UPDATED,
      requestId: options?.requestId,
    });
  }

  /**
   * Builds and optionally dispatches an HTTP 200 OK deleted success response.
   */
  public static deleted<T>(
    res: Response | null,
    data?: T,
    options?: { message?: string; requestId?: string }
  ): Response | ApiSuccessResponse<T> {
    return ResponseBuilder.success(res, data ?? ({} as T), {
      statusCode: HTTP_STATUS_CODES.OK,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGES.DELETED,
      requestId: options?.requestId,
    });
  }

  /**
   * Builds and optionally dispatches an HTTP 202 Accepted response.
   */
  public static accepted<T>(
    res: Response | null,
    data?: T,
    options?: { message?: string; requestId?: string }
  ): Response | ApiSuccessResponse<T> {
    return ResponseBuilder.success(res, data ?? ({} as T), {
      statusCode: HTTP_STATUS_CODES.ACCEPTED,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGES.ACCEPTED,
      requestId: options?.requestId,
    });
  }

  /**
   * Dispatches an HTTP 204 No Content response.
   */
  public static noContent(res: Response | null): Response | void {
    if (res !== null) {
      return res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    }
  }

  /**
   * Builds and optionally dispatches an HTTP 200 OK paginated success response.
   */
  public static paginated<T>(
    res: Response | null,
    data: readonly T[],
    paginationParams: PaginationParams,
    options?: { statusCode?: HttpStatusCode; message?: string; requestId?: string }
  ): Response | PaginatedResponse<T> {
    const responsePayload = createPaginatedResponse(data, paginationParams, {
      statusCode: options?.statusCode ?? HTTP_STATUS_CODES.OK,
      message: options?.message ?? DEFAULT_SUCCESS_MESSAGES.SUCCESS,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  // ==========================================
  // ERROR RESPONSE BUILDERS
  // ==========================================

  /**
   * Builds and optionally dispatches an HTTP 400 Bad Request error response.
   */
  public static badRequest(
    res: Response | null,
    message?: string,
    options?: { error?: string; details?: Record<string, unknown>; requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      error: options?.error ?? ERROR_NAMES.BAD_REQUEST_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.BAD_REQUEST,
      details: options?.details,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 401 Unauthorized error response.
   */
  public static unauthorized(
    res: Response | null,
    message?: string,
    options?: { error?: string; requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
      error: options?.error ?? ERROR_NAMES.AUTHENTICATION_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.UNAUTHORIZED,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 403 Forbidden error response.
   */
  public static forbidden(
    res: Response | null,
    message?: string,
    options?: { error?: string; requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.FORBIDDEN,
      error: options?.error ?? ERROR_NAMES.AUTHORIZATION_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.FORBIDDEN,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 404 Not Found error response.
   */
  public static notFound(
    res: Response | null,
    message?: string,
    options?: { error?: string; requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      error: options?.error ?? ERROR_NAMES.NOT_FOUND_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.NOT_FOUND,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 409 Conflict error response.
   */
  public static conflict(
    res: Response | null,
    message?: string,
    options?: { error?: string; requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.CONFLICT,
      error: options?.error ?? ERROR_NAMES.CONFLICT_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.CONFLICT,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 422 Unprocessable Entity validation error response.
   */
  public static validationError(
    res: Response | null,
    details: readonly ValidationErrorDetail[],
    message?: string,
    options?: { requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
      error: ERROR_NAMES.VALIDATION_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.VALIDATION,
      details,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }

  /**
   * Builds and optionally dispatches an HTTP 500 Internal Server Error response.
   */
  public static internalServerError(
    res: Response | null,
    message?: string,
    options?: { error?: string; requestId?: string }
  ): Response | ApiErrorResponse {
    const responsePayload = createErrorResponse({
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error: options?.error ?? ERROR_NAMES.INTERNAL_SERVER_ERROR,
      message: message ?? DEFAULT_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      requestId: options?.requestId,
    });

    if (res !== null) {
      return res.status(responsePayload.statusCode).json(responsePayload);
    }

    return responsePayload;
  }
}
