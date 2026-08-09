import { z } from "zod";
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../database/pagination.js";
import { VALIDATION_LIMITS, VALIDATION_PATTERNS } from "./validation.constants.js";
import { sanitizeEmail, sanitizeString } from "./validation.utils.js";

/**
 * Reusable ID schema requiring a non-empty string.
 */
export const idSchema = z
  .string({ required_error: "ID parameter is required" })
  .trim()
  .min(1, { message: "ID cannot be empty" });

/**
 * Reusable UUID v4 schema.
 */
export const uuidSchema = z
  .string({ required_error: "UUID is required" })
  .trim()
  .regex(VALIDATION_PATTERNS.UUID_V4, { message: "Invalid UUID v4 format" });

/**
 * Standard sanitized email schema.
 */
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .min(1, { message: "Email is required" })
  .max(VALIDATION_LIMITS.MAX_EMAIL_LENGTH, {
    message: `Email cannot exceed ${VALIDATION_LIMITS.MAX_EMAIL_LENGTH} characters`,
  })
  .email({ message: "Invalid email address format" })
  .transform((val) => sanitizeEmail(val));

/**
 * Standard password schema for authentication and user management.
 */
export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(VALIDATION_LIMITS.MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${VALIDATION_LIMITS.MIN_PASSWORD_LENGTH} characters`,
  })
  .max(VALIDATION_LIMITS.MAX_PASSWORD_LENGTH, {
    message: `Password cannot exceed ${VALIDATION_LIMITS.MAX_PASSWORD_LENGTH} characters`,
  });

/**
 * Sort order direction schema ('asc' | 'desc').
 */
export const sortOrderSchema = z
  .enum(["asc", "desc"], {
    errorMap: () => ({ message: "Sort order must be 'asc' or 'desc'" }),
  })
  .default("asc");

/**
 * Reusable pagination and sorting query schema.
 */
export const paginationQuerySchema = z.object({
  page: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return DEFAULT_PAGE;
      const parsed = Number(val);
      return Number.isFinite(parsed) ? parsed : DEFAULT_PAGE;
    }, z.number().int().min(1, { message: "Page must be a positive integer" }))
    .default(DEFAULT_PAGE),
  limit: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return DEFAULT_LIMIT;
      const parsed = Number(val);
      return Number.isFinite(parsed) ? parsed : DEFAULT_LIMIT;
    }, z.number().int().min(1).max(MAX_LIMIT, { message: `Limit cannot exceed ${MAX_LIMIT}` }))
    .default(DEFAULT_LIMIT),
  sort: z.string().trim().optional(),
  order: sortOrderSchema,
});

/**
 * Query schema coercing string representation ('true', 'false', '1', '0') to boolean.
 */
export const booleanQuerySchema = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
  }
  return val;
}, z.boolean({ invalid_type_error: "Value must be a boolean" }));

/**
 * Coerced positive integer schema.
 */
export const positiveIntSchema = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = Number(val.trim());
    return Number.isFinite(num) ? num : val;
  }
  return val;
}, z.number().int().positive({ message: "Must be a positive integer" }));

/**
 * Factory creating a bounded string schema.
 */
export function boundedStringSchema(min: number = 0, max: number = VALIDATION_LIMITS.MAX_SHORT_TEXT_LENGTH) {
  return z
    .string()
    .trim()
    .min(min, { message: `Text must be at least ${min} characters` })
    .max(max, { message: `Text cannot exceed ${max} characters` })
    .transform((val) => sanitizeString(val));
}

/**
 * Optional string schema that converts empty strings to undefined.
 */
export const optionalStringSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") return undefined;
    return sanitizeString(val);
  });
