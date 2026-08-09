import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import { ValidationErrorDetail } from "../responses/response.types.js";
import { ValidationError } from "../errors/app-error.js";
import { RequestContext } from "../context/request-context.js";
import { formatZodError } from "./validation.errors.js";
import { ValidationOptions, ValidationSchemas } from "./validation.types.js";
import { sanitizeObject } from "./validation.utils.js";

/**
 * Higher-order Express validation middleware.
 * Validates request body, query params, URL parameters, and headers against Zod schemas.
 * Replaces request data with parsed/sanitized data upon success or forwards a ValidationError.
 *
 * @param schemas Object containing optional Zod schemas for body, params, query, headers
 * @param options Validation execution options
 * @returns Express RequestHandler
 */
export function validate(
  schemas: ValidationSchemas,
  options?: ValidationOptions
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const accumulatedDetails: ValidationErrorDetail[] = [];
      const requestId = options?.requestId ?? RequestContext.getRequestId();

      // 1. Validate Body
      if (schemas.body) {
        const sanitizedBody = sanitizeObject(req.body);
        const result = await schemas.body.safeParseAsync(sanitizedBody);

        if (result.success) {
          req.body = result.data;
        } else {
          accumulatedDetails.push(...formatZodError(result.error));
        }
      }

      // 2. Validate Params
      if (schemas.params) {
        const result = await schemas.params.safeParseAsync(req.params);

        if (result.success) {
          req.params = result.data as Record<string, string>;
        } else {
          accumulatedDetails.push(...formatZodError(result.error, "params"));
        }
      }

      // 3. Validate Query
      if (schemas.query) {
        const result = await schemas.query.safeParseAsync(req.query);

        if (result.success) {
          req.query = result.data as unknown as Request["query"];
        } else {
          accumulatedDetails.push(...formatZodError(result.error, "query"));
        }
      }

      // 4. Validate Headers
      if (schemas.headers) {
        const result = await schemas.headers.safeParseAsync(req.headers);

        if (!result.success) {
          accumulatedDetails.push(...formatZodError(result.error, "headers"));
        }
      }

      // If validation errors occurred, throw unified ValidationError
      if (accumulatedDetails.length > 0) {
        const validationError = new ValidationError(
          "Input validation failed for the provided request",
          accumulatedDetails,
          requestId
        );
        return next(validationError);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
