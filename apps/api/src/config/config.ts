import { ApiConfig } from "./config.types.js";
import { env } from "./env.js";

/**
 * Centralized Enterprise Application Configuration Object.
 * Encapsulates all application settings cleanly behind type-safe domain namespaces.
 */
export const config: ApiConfig & { port: number; env: string } = {
  port: env.PORT,
  env: env.NODE_ENV,
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",
  },
  database: {
    url: env.DATABASE_URL,
    logQueries: env.NODE_ENV === "development",
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtAccessExpires: env.JWT_ACCESS_EXPIRES,
    jwtRefreshExpires: env.JWT_REFRESH_EXPIRES,
    adminEmail: env.ADMIN_EMAIL,
    adminPassword: env.ADMIN_PASSWORD,
    subAdminEmail: env.SUB_ADMIN_EMAIL,
    subAdminPassword: env.SUB_ADMIN_PASSWORD,
  },
  security: {
    corsOrigin: env.CORS_ORIGIN,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  ai: {
    provider: env.AI_PROVIDER,
    apiKey: env.AI_API_KEY,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
  },
};
