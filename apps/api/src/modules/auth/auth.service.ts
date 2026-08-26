import { config } from "../../config/index.js";
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { domainEventBus } from "../../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { jwtService as defaultJwtService, JwtService } from "../../core/security/jwt.service.js";
import { passwordService as defaultPasswordService, PasswordService } from "../../core/security/password.service.js";
import { getPermissionsForRole } from "../../core/security/permissions.js";
import { SecurityLogger } from "../../core/security/security.logger.js";
import { sanitizeUser } from "./auth.mapper.js";
import { authRepository as defaultAuthRepository, AuthRepository } from "./auth.repository.js";
import { AuthTokenPayload, RefreshTokenPayload, SafeUser } from "./auth.types.js";
import { ChangePasswordDto, LoginDto, RegisterDto } from "./auth.validation.js";

/**
 * Enterprise Service orchestrating authentication business logic.
 */
export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly jwtService: JwtService;
  private readonly passwordService: PasswordService;

  constructor(
    authRepository: AuthRepository = defaultAuthRepository,
    jwtService: JwtService = defaultJwtService,
    passwordService: PasswordService = defaultPasswordService
  ) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
    this.passwordService = passwordService;
  }

  /**
   * Registers a new user account.
   * Public self-registration is strictly disabled across ST-Solutions.
   * Only Administrators and Sub-Administrators can provision subordinate accounts.
   */
  public async register(
    _dto: RegisterDto,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthTokenPayload> {
    SecurityLogger.logAuthFailure({
      reason: "Public self-registration attempt blocked - registration endpoint is disabled",
      endpoint: "/auth/register",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    throw new AuthorizationError(
      "Public registration is disabled. Accounts can only be provisioned by an Administrator or Sub-Administrator via the internal management portal.",
      ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
    );
  }

  /**
   * Authenticates user credentials, verifies account status, issues JWT token pair, and tracks session.
   * Supports:
   * 1. Environment-variable root authentication for Administrator & Sub-Administrator.
   * 2. Database User ID or Email authentication for Managers and Members.
   */
  public async login(
    dto: LoginDto,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthTokenPayload> {
    const rawIdentifier = dto.identifier || dto.email || "";
    const identifier = rawIdentifier.trim();

    if (!identifier || !dto.password) {
      throw new AuthenticationError("Identifier and password are required", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    const adminEmail = (config.auth.adminEmail || "admin@st-solutions.com").toLowerCase().trim();
    const adminPassword = config.auth.adminPassword || "Admin@123456";
    const subAdminEmail = (config.auth.subAdminEmail || "subadmin@st-solutions.com").toLowerCase().trim();
    const subAdminPassword = config.auth.subAdminPassword || "SubAdmin@123456";

    let user: any = null;
    let isRootEnvAuth = false;

    // 1. Check Root Administrator environment variable credentials
    if (identifier.toLowerCase() === adminEmail) {
      if (dto.password === adminPassword) {
        isRootEnvAuth = true;
        user = await this.authRepository.findByEmail(adminEmail);
        if (!user) {
          try {
            const passwordHash = await this.passwordService.hashPassword(adminPassword);
            user = await this.authRepository.createUserWithRegistration({
              email: adminEmail,
              passwordHash,
              fullName: "Shaf Tech Admin",
              accountType: "ADMIN" as any,
            });
          } catch {
            user = await this.authRepository.findByEmail(adminEmail);
          }
        }
      }
    }

    // 2. Check Root Sub-Administrator environment variable credentials
    if (!isRootEnvAuth && identifier.toLowerCase() === subAdminEmail) {
      if (dto.password === subAdminPassword) {
        isRootEnvAuth = true;
        user = await this.authRepository.findByEmail(subAdminEmail);
        if (!user) {
          try {
            const passwordHash = await this.passwordService.hashPassword(subAdminPassword);
            user = await this.authRepository.createUserWithRegistration({
              email: subAdminEmail,
              passwordHash,
              fullName: "Sub-Administrator",
              accountType: "SUB_ADMIN" as any,
            });
          } catch {
            user = await this.authRepository.findByEmail(subAdminEmail);
          }
        }
      }
    }

    // 3. If not root env matched, find user in database via User ID or Email
    if (!isRootEnvAuth) {
      user = await this.authRepository.findByIdentifier(identifier);

      if (!user) {
        SecurityLogger.logAuthFailure({
          reason: `Invalid credentials provided for identifier: ${identifier}`,
          endpoint: "/auth/login",
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        });
        throw new AuthenticationError("Invalid email, User ID, or password", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      }

      // Verify password
      let isPasswordValid = false;
      if (user.passwordHash) {
        isPasswordValid = await this.passwordService.comparePassword(dto.password, user.passwordHash);
      }

      // Allow fallback check against root admin/subadmin passwords if accounts match email
      if (!isPasswordValid && user.email?.toLowerCase() === adminEmail && dto.password === adminPassword) {
        isPasswordValid = true;
      }
      if (!isPasswordValid && user.email?.toLowerCase() === subAdminEmail && dto.password === subAdminPassword) {
        isPasswordValid = true;
      }

      if (!isPasswordValid) {
        SecurityLogger.logAuthFailure({
          reason: "Invalid password provided",
          userId: user.id,
          endpoint: "/auth/login",
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        });
        throw new AuthenticationError("Invalid email, User ID, or password", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      }
    }

    // Check account status
    if (user.status === "SUSPENDED") {
      throw new AuthenticationError("Your account has been suspended by an administrator", ERROR_CODES.AUTH_ACCOUNT_DISABLED);
    }
    if (user.status === "INACTIVE") {
      throw new AuthenticationError("Your account is currently deactivated", ERROR_CODES.AUTH_ACCOUNT_DISABLED);
    }
    if (user.status === "PENDING") {
      throw new AuthenticationError(
        "Your account is pending administrator activation",
        ERROR_CODES.AUTH_ACCOUNT_DISABLED
      );
    }

    // Extract authoritative permissions for accountType
    const dbPermissions: string[] = user.role?.permissions
      ? user.role.permissions.map((rp: any) => rp.permission?.name || rp)
      : [];
    const staticPermissions = getPermissionsForRole(user.accountType || user.role?.name);
    const permissions = Array.from(new Set([...staticPermissions, ...dbPermissions]));

    // Issue JWT tokens
    const tokenPair = this.jwtService.signTokenPair({
      sub: user.id,
      email: user.email ?? undefined,
      accountType: user.accountType,
      role: user.role?.name,
      permissions,
    });

    // Store active session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    try {
      await this.authRepository.createSession({
        userId: user.id,
        tokenHash: tokenPair.refreshToken,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        expiresAt,
      });
    } catch {
      // Session storage non-fatal fallback
    }

    SecurityLogger.logAuthSuccess({
      userId: user.id,
      endpoint: "/auth/login",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    const safeUser = sanitizeUser(user);

    return {
      user: safeUser,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
      tokenType: "Bearer",
    };
  }

  /**
   * Verifies a refresh token and issues a new access/refresh token pair.
   */
  public async refreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new AuthenticationError("User associated with refresh token not found", ERROR_CODES.AUTH_UNAUTHORIZED);
    }

    if (user.status !== "ACTIVE") {
      throw new AuthenticationError("Account is not active", ERROR_CODES.AUTH_ACCOUNT_DISABLED);
    }

    const dbPermissions: string[] = user.role?.permissions
      ? user.role.permissions.map((rp: any) => rp.permission?.name || rp)
      : [];
    const staticPermissions = getPermissionsForRole(user.accountType || user.role?.name);
    const permissions = Array.from(new Set([...staticPermissions, ...dbPermissions]));

    const tokenPair = this.jwtService.signTokenPair({
      sub: user.id,
      email: user.email ?? undefined,
      accountType: user.accountType,
      role: user.role?.name,
      permissions,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
      tokenType: "Bearer",
    };
  }

  /**
   * Logs out user by revoking sessions.
   */
  public async logout(userId: string): Promise<{ message: string }> {
    await this.authRepository.deleteUserSessions(userId);
    return { message: "Logged out successfully" };
  }

  /**
   * Retrieves profile details for the currently authenticated user.
   */
  public async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID '${userId}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    return sanitizeUser(user);
  }

  /**
   * Changes authenticated user's password and invalidates existing sessions.
   */
  public async changePassword(
    userId: string,
    dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID '${userId}' was not found`, ERROR_CODES.USER_NOT_FOUND);
    }

    const isPasswordValid = await this.passwordService.comparePassword(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError("Current password is incorrect", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    const newPasswordHash = await this.passwordService.hashPassword(dto.newPassword);
    await this.authRepository.updatePasswordHash(userId, newPasswordHash);

    // Invalidate existing sessions
    await this.authRepository.deleteUserSessions(userId);

    return { message: "Password updated successfully. Please log in again with your new password." };
  }
}

export const authService = new AuthService();
