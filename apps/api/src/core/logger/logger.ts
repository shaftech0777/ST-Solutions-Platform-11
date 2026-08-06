import pino, { Logger as PinoLogger } from "pino";
import { loggerConfig } from "./logger.config.js";
import { LoggerContext } from "./logger.types.js";
import { getLogContext } from "./logger.utils.js";

/**
 * Underlying raw Pino instance configured with redaction and formatting.
 */
export const pinoInstance: PinoLogger = pino({
  level: loggerConfig.level,
  redact: {
    paths: [...loggerConfig.redactFields],
    censor: "[REDACTED]",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(loggerConfig.prettyPrint && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

/**
 * Centralized Enterprise Logger Service wrapper.
 * Automatically enriches log outputs with AsyncLocalStorage RequestContext metadata.
 */
export class Logger {
  /**
   * Helper to normalize arguments into (obj, msg) format for Pino.
   */
  private static formatArgs(
    arg1: string | Record<string, unknown>,
    arg2?: string | Record<string, unknown>
  ): [Record<string, unknown>, string] {
    const reqContext = getLogContext();

    if (typeof arg1 === "string") {
      const extraContext = (typeof arg2 === "object" && arg2 !== null ? arg2 : {}) as Record<string, unknown>;
      return [{ ...reqContext, ...extraContext }, arg1];
    }

    const objContext = (typeof arg1 === "object" && arg1 !== null ? arg1 : {}) as Record<string, unknown>;
    const message = typeof arg2 === "string" ? arg2 : "";
    return [{ ...reqContext, ...objContext }, message];
  }

  public static info(message: string, context?: Record<string, unknown>): void;
  public static info(context: Record<string, unknown>, message?: string): void;
  public static info(
    arg1: string | Record<string, unknown>,
    arg2?: string | Record<string, unknown>
  ): void {
    const [ctx, msg] = Logger.formatArgs(arg1, arg2);
    pinoInstance.info(ctx, msg);
  }

  public static warn(message: string, context?: Record<string, unknown>): void;
  public static warn(context: Record<string, unknown>, message?: string): void;
  public static warn(
    arg1: string | Record<string, unknown>,
    arg2?: string | Record<string, unknown>
  ): void {
    const [ctx, msg] = Logger.formatArgs(arg1, arg2);
    pinoInstance.warn(ctx, msg);
  }

  public static error(message: string, context?: Record<string, unknown>): void;
  public static error(context: Record<string, unknown>, message?: string): void;
  public static error(
    arg1: string | Record<string, unknown>,
    arg2?: string | Record<string, unknown>
  ): void {
    const [ctx, msg] = Logger.formatArgs(arg1, arg2);
    pinoInstance.error(ctx, msg);
  }

  public static debug(message: string, context?: Record<string, unknown>): void;
  public static debug(context: Record<string, unknown>, message?: string): void;
  public static debug(
    arg1: string | Record<string, unknown>,
    arg2?: string | Record<string, unknown>
  ): void {
    const [ctx, msg] = Logger.formatArgs(arg1, arg2);
    pinoInstance.debug(ctx, msg);
  }

  public static fatal(message: string, context?: Record<string, unknown>): void;
  public static fatal(context: Record<string, unknown>, message?: string): void;
  public static fatal(
    arg1: string | Record<string, unknown>,
    arg2?: string | Record<string, unknown>
  ): void {
    const [ctx, msg] = Logger.formatArgs(arg1, arg2);
    pinoInstance.fatal(ctx, msg);
  }

  /**
   * Creates a Pino child logger scoped with custom fixed bindings.
   *
   * @param bindings Key-value pairs to bind permanently to child logger instance
   * @returns PinoLogger child instance
   */
  public static createChildLogger(bindings: Record<string, unknown>): PinoLogger {
    return pinoInstance.child(bindings);
  }
}
