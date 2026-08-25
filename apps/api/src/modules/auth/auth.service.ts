import { AuthenticationError, ConflictError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { domainEventBus } from "../../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { jwtService as defaultJwtService, JwtService } from "../../core/security/jwt.service.js";
import { passwordService as defaultPasswordService, PasswordService } from "../../core/security/password.service.js";
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
   * Registers a new user, hashes password, creates profile and optional default organization.
   */
  public async register(
    dto: RegisterDto,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthTokenPayload> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.authRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError("Email address is already registered", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const user = await this.authRepository.createUserWithRegistration({
      email: normalizedEmail,
      passwordHash,
      fullName: dto.fullName.trim(),
      accountType: dto.accountType,
      organizationName: dto.organizationName,
    });

    const permissions: string[] = user.role?.permissions
      ? user.role.permissions.map((rp: any) => rp.permission.name)
      : [];

    const tokenPair = this.jwtService.signTokenPair({
      sub: user.id,
      email: user.email ?? undefined,
      accountType: user.accountType,
      role: user.role?.name,
      permissions,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepository.createSession({
      userId: user.id,
      tokenHash: tokenPair.refreshToken,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expiresAt,
    });

    await domainEventBus.publish({
      eventName: DOMAIN_EVENTS.USER_REGISTERED,
      entityType: "User",
      entityId: user.id,
      actorId: user.id,
      timestamp: new Date(),
      payload: {
        userId: user.id,
        email: user.email,
        fullName: dto.fullName,
      },
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
   * Authenticates user credentials, verifies account status, issues JWT token pair, and tracks session.
   */
  public async login(
    dto: LoginDto,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthTokenPayload> {
    const user = await this.authRepository.findByEmail(dto.email);

    if (!user) {
      SecurityLogger.logAuthFailure({
        reason: "Invalid email credentials provided",
        endpoint: "/auth/login",
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      });
      throw new AuthenticationError("Invalid email or password", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    // Verify password first
    const isPasswordValid = await this.passwordService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      SecurityLogger.logAuthFailure({
        reason: "Invalid password provided",
        userId: user.id,
        endpoint: "/auth/login",
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      });
      throw new AuthenticationError("Invalid email or password", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    // Check account status
    if (user.status === "SUSPENDED") {
      throw new AuthenticationError("Your account has been suspended", ERROR_CODES.AUTH_ACCOUNT_DISABLED);
    }
    if (user.status === "INACTIVE") {
      throw new AuthenticationError("Your account is currently inactive", ERROR_CODES.AUTH_ACCOUNT_DISABLED);
    }
    if (user.status === "PENDING") {
      throw new AuthenticationError(
        "Your account registration is pending approval",
        ERROR_CODES.AUTH_ACCOUNT_DISABLED
      );
    }

    // Extract permissions
    const permissions: string[] = user.role?.permissions
      ? user.role.permissions.map((rp: any) => rp.permission.name)
      : [];

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
    await this.authRepository.createSession({
      userId: user.id,
      tokenHash: tokenPair.refreshToken,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expiresAt,
    });

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

    const permissions: string[] = user.role?.permissions
      ? user.role.permissions.map((rp: any) => rp.permission.name)
      : [];

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
