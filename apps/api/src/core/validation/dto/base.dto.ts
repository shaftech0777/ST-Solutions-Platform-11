import { z } from "zod";

/**
 * Infer TypeScript DTO type directly from a Zod schema definition.
 */
export type InferDto<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * Generic Base Request DTO wrapper schema interface contract.
 */
export interface BaseRequestDto<TBody = unknown, TQuery = unknown, TParams = unknown> {
  readonly body?: TBody;
  readonly query?: TQuery;
  readonly params?: TParams;
}

/**
 * Base Abstract DTO Class for explicit transform methods when required by domain mappers.
 */
export abstract class BaseDto {
  /**
   * Converts the instance to a plain JavaScript object suitable for JSON serialization.
   */
  public toJSON(): Record<string, unknown> {
    return Object.assign({}, this) as Record<string, unknown>;
  }
}
