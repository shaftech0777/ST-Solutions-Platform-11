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
    .default(() => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default-development-jwt-secret-key-32charsmin"),
  JWT_ACCESS_EXPIRES: z.string().default("1h"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),

  // Root Administrator & Sub-Administrator Credentials
  ADMIN_EMAIL: z.string().email().default(() => process.env.ADMIN_EMAIL || "admin@st-solutions.com"),
  ADMIN_PASSWORD: z.string().min(6).default(() => process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Admin@123456"),
  SUB_ADMIN_EMAIL: z.string().email().default(() => process.env.SUB_ADMIN_EMAIL || "subadmin@st-solutions.com"),
  SUB_ADMIN_PASSWORD: z.string().min(6).default(() => process.env.SUB_ADMIN_PASSWORD || "SubAdmin@123456"),

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

  // n8n Automation & Email Notification Configuration
  N8N_BASE_URL: z.string().optional().default(""),
  N8N_CALLBACK_URL: z.string().optional().default(""),
  N8N_WEBHOOK_SECRET: z.string().optional().default(""),
  N8N_WEBHOOK_TIMEOUT_MS: z.coerce.number().int().min(500).max(60000).default(5000),
  N8N_ENABLED: z
    .preprocess((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
      return Boolean(process.env.N8N_BASE_URL && process.env.N8N_BASE_URL.trim().length > 0);
    }, z.boolean())
    .default(false),
  ADMIN_NOTIFICATION_EMAIL: z
    .string()
    .email()
    .optional()
    .default(() => process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@st-solutions.com"),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === "production") {
    if (!data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL is required in production environment.",
        path: ["DATABASE_URL"],
      });
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
