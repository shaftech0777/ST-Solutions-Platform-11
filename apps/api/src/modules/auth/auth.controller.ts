import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { authService as defaultAuthService, AuthService } from "./auth.service.js";
import { ChangePasswordDto, LoginDto, RefreshTokenDto } from "./auth.validation.js";

/**
 * Controller handling HTTP requests for Authentication endpoints.
 * Keeps routing logic thin and delegates domain business operations to AuthService.
 */
export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService = defaultAuthService) {
    this.authService = authService;
  }

  /**
   * Handles user login request.
   * POST /api/v1/auth/login
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const metadata = {
        ipAddress: req.ip || (req.headers["x-forwarded-for"] as string) || undefined,
        userAgent: req.headers["user-agent"],
      };

      const result = await this.authService.login(dto, metadata);

      ResponseBuilder.success(res, result, {
        message: "Authentication successful",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles JWT refresh token request.
   * POST /api/v1/auth/refresh
   */
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;
      const result = await this.authService.refreshToken(refreshToken);

      ResponseBuilder.success(res, result, {
        message: "Token refreshed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles user logout and session revocation request.
   * POST /api/v1/auth/logout
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId;

      if (userId) {
        await this.authService.logout(userId);
      }

      ResponseBuilder.success(res, { message: "Logged out successfully" }, {
        message: "User session revoked",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves profile information for the currently authenticated user.
   * GET /api/v1/auth/me
   */
  public getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        ResponseBuilder.unauthorized(res, "User authentication context missing");
        return;
      }

      const userProfile = await this.authService.getCurrentUser(userId);

      ResponseBuilder.success(res, userProfile, {
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles password change request for the current user.
   * POST /api/v1/auth/change-password
   */
  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        ResponseBuilder.unauthorized(res, "User authentication context missing");
        return;
      }

      const dto = req.body as ChangePasswordDto;

      const result = await this.authService.changePassword(userId, dto);

      ResponseBuilder.success(res, result, {
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
