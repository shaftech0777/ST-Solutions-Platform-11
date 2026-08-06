import { ValidationErrorDetail } from "../responses/response.types.js";
import { ErrorCode } from "./error.codes.js";

/**
 * Interface defining options for constructing an AppError instance.
 */
export interface AppErrorOptions {
  readonly name?: string;
  readonly message: string;
  readonly statusCode?: number;
  readonly errorCode?: ErrorCode | string;
  readonly isOperational?: boolean;
  readonly details?: readonly ValidationErrorDetail[] | Record<string, unknown>;
  readonly cause?: unknown;
  readonly requestId?: string;
}

/**
 * Interface defining the structure of a serialized error payload for responses and logging.
 */
export interface SerializedError {
  readonly success: false;
  readonly statusCode: number;
  readonly error: string;
  readonly errorCode: string;
  readonly message: string;
  readonly details?: readonly ValidationErrorDetail[] | Record<string, unknown>;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly stack?: string;
}
