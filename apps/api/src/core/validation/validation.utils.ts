import { z } from "zod";
import { SENSITIVE_INPUT_KEYS } from "./validation.constants.js";
import { formatZodError } from "./validation.errors.js";
import { ValidationResult } from "./validation.types.js";

/**
 * Safely sanitizes a raw text string by removing leading/trailing whitespace,
 * stripping null bytes and non-printable control characters, while preserving Unicode text.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== "string") {
    return "";
  }

  // Strip null characters and control characters except standard linebreaks/tabs
  const cleaned = val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  return cleaned.trim();
}

/**
 * Normalizes an email address string by stripping whitespace and converting to lowercase.
 */
export function sanitizeEmail(val: string): string {
  if (typeof val !== "string") {
    return "";
  }

  return val.trim().toLowerCase();
}

/**
 * Parses and sanitizes a value into a finite number, returning undefined if invalid or NaN.
 */
export function sanitizeNumeric(val: unknown): number | undefined {
  if (typeof val === "number" && Number.isFinite(val)) {
    return val;
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
  }

  return undefined;
}

/**
 * Parses a string or primitive representation into a strict boolean, or undefined if ambiguous.
 */
export function sanitizeBoolean(val: unknown): boolean | undefined {
  if (typeof val === "boolean") {
    return val;
  }

  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    if (lower === "true" || lower === "1" || lower === "yes") {
      return true;
    }
    if (lower === "false" || lower === "0" || lower === "no") {
      return false;
    }
  }

  if (typeof val === "number") {
    if (val === 1) return true;
    if (val === 0) return false;
  }

  return undefined;
}

/**
 * Recursively sanitizes string values inside an object/array payload.
 * Skips sensitive keys (passwords, tokens, keys) to prevent corrupting authentication data.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    return sanitizeString(input) as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof input === "object" && input.constructor === Object) {
    const record = input as Record<string, unknown>;
    const sanitizedRecord: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      if (SENSITIVE_INPUT_KEYS.has(key)) {
        // Leave sensitive payload values (e.g. passwords/tokens) completely untouched
        sanitizedRecord[key] = value;
      } else {
        sanitizedRecord[key] = sanitizeObject(value);
      }
    }

    return sanitizedRecord as T;
  }

  return input;
}

/**
 * Safely parses data against a Zod schema without throwing, returning a typed ValidationResult.
 */
export function safeParseSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
}
