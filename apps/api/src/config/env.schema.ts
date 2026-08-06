import { z } from "zod";

/**
 * Zod Schema for Environment Variables Validation.
 * Enforces strict typing, defaults, and security bounds for all runtime settings.
 */
export const envSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // Database Configuration
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("postgresql://postgres:postgres@localhost:5432/st_solutions?schema=public"),

  // Authentication Configuration
  JWT_SECRET: z
    .string()
    .min(1, "JWT_SECRET is required")
    .default("default-development-jwt-secret-key-32charsmin"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  // Security Configuration
  CORS_ORIGIN: z.string().default("*"),

  // Logging Configuration
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // AI Service Configuration
  AI_PROVIDER: z.string().default("gemini"),
  AI_API_KEY: z.string().optional(),

  // Email / SMTP Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === "production") {
    if (!data.DATABASE_URL || data.DATABASE_URL.includes("localhost")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production DATABASE_URL must be a valid non-local connection string",
        path: ["DATABASE_URL"],
      });
    }

    if (!data.JWT_SECRET || data.JWT_SECRET.includes("default-development")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production JWT_SECRET must be explicitly configured and cannot use default dev secret",
        path: ["JWT_SECRET"],
      });
    }

    if (data.JWT_SECRET && data.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production JWT_SECRET must be at least 32 characters long",
        path: ["JWT_SECRET"],
      });
    }
  }
});

/**
 * Inferred Environment Variables Type.
 */
export type EnvSchemaType = z.infer<typeof envSchema>;
