import pino from "pino";
import { config } from "./config.js";

export const logger = pino({
  level: config.logging.level,
  transport: !config.app.isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
});

