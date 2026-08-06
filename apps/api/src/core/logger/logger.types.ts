/**
 * Allowed Log Levels for Pino Logger.
 */
export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

/**
 * Contextual information automatically attached to structured logs.
 */
export interface LoggerContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

/**
 * Configuration options for initializing the Pino Logger.
 */
export interface LoggerConfigOptions {
  level: LogLevel;
  environment: string;
  redactFields: readonly string[];
  prettyPrint: boolean;
}
