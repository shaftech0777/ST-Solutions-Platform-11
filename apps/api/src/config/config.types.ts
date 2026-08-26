/**
 * Application environment runtime settings interface.
 */
export interface AppConfig {
  readonly env: "development" | "test" | "production";
  readonly port: number;
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
  readonly isTest: boolean;
}

/**
 * Database connection & query settings interface.
 */
export interface DatabaseConfig {
  readonly url: string;
  readonly logQueries: boolean;
}

/**
 * Authentication and JWT token configuration interface.
 */
export interface AuthConfig {
  readonly jwtSecret: string;
  readonly jwtAccessExpires: string;
  readonly jwtRefreshExpires: string;
  readonly adminEmail?: string;
  readonly adminPassword?: string;
  readonly subAdminEmail?: string;
  readonly subAdminPassword?: string;
}

/**
 * Security policy configuration interface.
 */
export interface SecurityConfig {
  readonly corsOrigin: string;
}

/**
 * Logging system configuration interface.
 */
export interface LoggingConfig {
  readonly level: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
}

/**
 * AI integrations configuration interface.
 */
export interface AiConfig {
  readonly provider: string;
  readonly apiKey?: string;
}

/**
 * Email & SMTP server configuration interface.
 */
export interface EmailConfig {
  readonly host?: string;
  readonly port?: number;
  readonly user?: string;
  readonly password?: string;
}

/**
 * Master Enterprise API Configuration Interface.
 */
export interface ApiConfig {
  readonly app: AppConfig;
  readonly database: DatabaseConfig;
  readonly auth: AuthConfig;
  readonly security: SecurityConfig;
  readonly logging: LoggingConfig;
  readonly ai: AiConfig;
  readonly email: EmailConfig;
}
