import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

/**
 * Strict Rate Limiter middleware specifically for authentication sensitive endpoints
 * (login, token refresh, password reset/change).
 * Helps prevent brute-force attacks and credential stuffing.
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    error: "TooManyRequests",
    errorCode: "RATE_LIMIT_EXCEEDED",
    message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Standard API Rate Limiter middleware for general API endpoints.
 */
export const apiRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    error: "TooManyRequests",
    errorCode: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP. Please try again later.",
  },
});
