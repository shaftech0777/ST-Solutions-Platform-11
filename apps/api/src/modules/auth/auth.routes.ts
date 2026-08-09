import { Router } from "express";
import { authenticate, authRateLimiter, validate } from "../../middlewares/index.js";
import { authController } from "./auth.controller.js";
import { changePasswordSchema, loginSchema, refreshTokenSchema } from "./auth.validation.js";

export const authRouter = Router();

/**
 * @route POST /auth/login
 * @desc Authenticates user with email and password
 * @access Public (Rate Limited)
 */
authRouter.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login
);

/**
 * @route POST /auth/refresh
 * @desc Issues new access token using a valid refresh token
 * @access Public (Rate Limited)
 */
authRouter.post(
  "/refresh",
  authRateLimiter,
  validate({ body: refreshTokenSchema }),
  authController.refreshToken
);

/**
 * @route POST /auth/logout
 * @desc Revokes user sessions and logs out user
 * @access Protected
 */
authRouter.post(
  "/logout",
  authenticate(),
  authController.logout
);

/**
 * @route GET /auth/me
 * @desc Retrieves current authenticated user profile
 * @access Protected
 */
authRouter.get(
  "/me",
  authenticate(),
  authController.getCurrentUser
);

/**
 * @route POST /auth/change-password
 * @desc Updates authenticated user password
 * @access Protected
 */
authRouter.post(
  "/change-password",
  authenticate(),
  validate({ body: changePasswordSchema }),
  authController.changePassword
);
