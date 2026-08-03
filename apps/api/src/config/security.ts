import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export const securityConfig = {
  helmet: helmet(),
  cors: cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again later." },
  }),
};
