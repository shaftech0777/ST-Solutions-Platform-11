import { z } from "zod";
import { ValidationErrorDetail } from "../responses/response.types.js";
import { ValidationError } from "../errors/app-error.js";

/**
 * Formats a Zod validation error into a standardized array of field error details.
 *
 * @param error ZodError instance
 * @param sourcePrefix Optional prefix identifying the input source (e.g., 'body', 'query')
 * @returns Array of ValidationErrorDetail objects containing path and message
 */
export function formatZodError(
  error: z.ZodError,
  sourcePrefix?: string
): readonly ValidationErrorDetail[] {
  return error.issues.map((issue) => {
    const rawPath = issue.path.join(".");
    const pathStr = rawPath.length > 0 ? rawPath : "root";
    const field = sourcePrefix ? `${sourcePrefix}.${pathStr}` : pathStr;

    return {
      field,
      message: issue.message,
    };
  });
}

/**
 * Creates a domain-standard ValidationError wrapping Zod issue details.
 *
 * @param error ZodError instance
 * @param customMessage Optional overall error message override
 * @param requestId Optional correlation request ID
 * @returns Configured ValidationError instance
 */
export function createValidationError(
  error: z.ZodError,
  customMessage?: string,
  requestId?: string
): ValidationError {
  const details = formatZodError(error);
  const message = customMessage ?? "Input validation failed for the provided request";

  return new ValidationError(message, details, requestId);
}
