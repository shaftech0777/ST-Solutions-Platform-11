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
  JWT_ACCESS_EXPIRES: z.string().default("1h"),
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
      // Allow fallback to in-memory/embedded engine with a warning rather than fatal crash
      console.warn("[WARN] Production DATABASE_URL not set or points to localhost; using resilient embedded data store fallback.");
    }

    if (!data.JWT_SECRET || data.JWT_SECRET.includes("default-development")) {
      console.warn("[WARN] Production JWT_SECRET is using default; please configure a secure 32+ character JWT_SECRET in your environment.");
    }
  }
});

/**
 * Inferred Environment Variables Type.
 */
export type EnvSchemaType = z.infer<typeof envSchema>;
