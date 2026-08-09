import { Request } from "express";
import { z } from "zod";

/**
 * HTTP Request component sources available for Zod schema validation.
 */
export type ValidationSource = "body" | "params" | "query" | "headers";

/**
 * Map of optional Zod validation schemas keyed by request source component.
 */
export interface ValidationSchemas {
  readonly body?: z.ZodType<unknown>;
  readonly params?: z.ZodType<unknown>;
  readonly query?: z.ZodType<unknown>;
  readonly headers?: z.ZodType<unknown>;
}

/**
 * Options for configuring validation middleware execution behavior.
 */
export interface ValidationOptions {
  /**
   * Whether to strip unrecognised keys from body objects (default: true).
   */
  readonly stripUnknown?: boolean;
  /**
   * Request ID for error correlation context.
   */
  readonly requestId?: string;
}

/**
 * Strongly typed Express Request with parsed/validated payload types.
 */
export type ValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  THeaders = unknown,
> = Request<
  TParams extends Record<string, string> ? TParams : Record<string, string>,
  unknown,
  TBody,
  TQuery extends Record<string, unknown> ? TQuery : Record<string, unknown>,
  THeaders extends Record<string, string> ? THeaders : Record<string, string>
>;

/**
 * Result structure returned by standalone schema parsing/validation.
 */
export type ValidationResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly errors: readonly { readonly field: string; readonly message: string }[] };
