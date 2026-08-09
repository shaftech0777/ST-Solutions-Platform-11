import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../../config/index.js";
import { AuthenticationError } from "../errors/app-error.js";
import { ERROR_CODES } from "../errors/error.codes.js";
import { JwtPayload, TokenPair, TokenType } from "./security.types.js";

/**
 * Enterprise Centralized Service for signing and verifying JWT authentication tokens.
 */
export class JwtService {
  private readonly secret: Secret;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    secret: Secret = config.auth.jwtSecret,
    accessExpiresIn: string = config.auth.jwtAccessExpires,
    refreshExpiresIn: string = config.auth.jwtRefreshExpires
  ) {
    if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
      throw new Error("JwtServiceError: JWT secret key is not configured or invalid");
    }
    this.secret = secret;
    this.accessExpiresIn = accessExpiresIn;
    this.refreshExpiresIn = refreshExpiresIn;
  }

  /**
   * Signs a short-lived access JWT token for an authenticated user.
   */
  public signAccessToken(payload: Omit<JwtPayload, "type">): string {
    const fullPayload: JwtPayload = {
      ...payload,
      type: "access",
    };

    const options: SignOptions = {
      expiresIn: this.accessExpiresIn as unknown as SignOptions["expiresIn"],
    };

    return jwt.sign(fullPayload, this.secret, options);
  }

  /**
   * Signs a long-lived refresh JWT token for user session persistence.
   */
  public signRefreshToken(payload: Omit<JwtPayload, "type">): string {
    const fullPayload: JwtPayload = {
      ...payload,
      type: "refresh",
    };

    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn as unknown as SignOptions["expiresIn"],
    };

    return jwt.sign(fullPayload, this.secret, options);
  }

  /**
   * Signs a full access/refresh token pair.
   */
  public signTokenPair(payload: Omit<JwtPayload, "type">): TokenPair {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: this.parseExpiryToSeconds(this.accessExpiresIn),
    };
  }

  /**
   * Verifies an access token and returns the typed payload.
   */
  public verifyAccessToken(token: string): JwtPayload {
    return this.verifyToken(token, "access");
  }

  /**
   * Verifies a refresh token and returns the typed payload.
   */
  public verifyRefreshToken(token: string): JwtPayload {
    return this.verifyToken(token, "refresh");
  }

  /**
   * Verifies a JWT token, ensuring signature validity, expiration, and expected token type.
   */
  public verifyToken(token: string, expectedType?: TokenType): JwtPayload {
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw new AuthenticationError("Authentication token is missing or empty", ERROR_CODES.AUTH_MISSING_HEADER);
    }

    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;

      if (!decoded.sub) {
        throw new AuthenticationError("Invalid token: Subject (sub) is missing", ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      if (expectedType && decoded.type !== expectedType) {
        throw new AuthenticationError(
          `Invalid token type. Expected '${expectedType}' token`,
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      return decoded;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError("Authentication token has expired", ERROR_CODES.AUTH_TOKEN_EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError("Invalid authentication token signature or payload", ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      throw new AuthenticationError("Authentication failed due to token verification error", ERROR_CODES.AUTH_UNAUTHORIZED);
    }
  }

  /**
   * Converts expiration string (e.g. '15m', '7d') into seconds.
   */
  private parseExpiryToSeconds(expiryStr: string): number {
    const match = expiryStr.match(/^(\d+)([smhd])?$/);
    if (!match) return 900;
    const num = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case "s": return num;
      case "m": return num * 60;
      case "h": return num * 3600;
      case "d": return num * 86400;
      default: return num;
    }
  }
}

export const jwtService = new JwtService();
