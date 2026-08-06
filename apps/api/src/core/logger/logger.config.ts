import { config } from "../../config/index.js";
import { LoggerConfigOptions, LogLevel } from "./logger.types.js";

/**
 * List of sensitive key paths automatically redacted by Pino in log outputs.
 */
export const SENSITIVE_REDACTION_KEYS: readonly string[] = [
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.secret",
  "*.apiKey",
  "*.authorization",
  "headers.authorization",
  "headers.cookie",
  "req.headers.authorization",
  "req.headers.cookie",
];

/**
 * Enterprise Pino Logger Configuration derived from centralized config system.
 */
export const loggerConfig: LoggerConfigOptions = {
  level: config.logging.level as LogLevel,
  environment: config.app.env,
  redactFields: SENSITIVE_REDACTION_KEYS,
  prettyPrint: !config.app.isProduction,
};
