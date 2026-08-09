/**
 * Validation constants and boundary constraints.
 */
export const VALIDATION_LIMITS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_SHORT_TEXT_LENGTH: 255,
  MAX_LONG_TEXT_LENGTH: 4000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Common regular expressions for string field validation.
 */
export const VALIDATION_PATTERNS = {
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  CUID: /^c[a-z0-9]{24,}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PHONE_E164: /^\+[1-9]\d{1,14}$/,
  ALPHA_NUMERIC_HYPHEN: /^[a-zA-Z0-9_-]+$/,
} as const;

/**
 * Keys in objects that must NEVER be mutated by generic sanitizers.
 */
export const SENSITIVE_INPUT_KEYS: ReadonlySet<string> = new Set([
  "password",
  "oldPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "refreshToken",
  "accessToken",
  "secret",
  "apiKey",
  "privateKey",
  "signature",
]);
