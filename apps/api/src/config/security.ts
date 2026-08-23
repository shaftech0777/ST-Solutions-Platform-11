import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";

export const securityConfig = {
  helmet: helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  }),
  cors: cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const configuredOrigin = config.security.corsOrigin || "*";
      if (configuredOrigin === "*") {
        return callback(null, true);
      }

      const allowedList = configuredOrigin.split(",").map((o) => o.trim());

      const isAllowed =
        allowedList.includes(origin) ||
        origin === "https://st-solutions.vercel.app" ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".run.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:");

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(null, true); // Fallback gracefully
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-organization-id",
      "x-workspace-id",
      "x-request-id",
      "Accept",
    ],
  }),
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: "Too many requests from this IP, please try again later." },
  }),
};

