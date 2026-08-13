import { Request } from "express";

/**
 * Supported JWT Token categories.
 */
export type TokenType = "access" | "refresh";

/**
 * Standard JWT Payload structure for user authentication and authorization.
 */
export interface JwtPayload {
  readonly sub: string;
  readonly sessionId?: string;
  readonly email?: string;
  readonly accountType?: string;
  readonly role?: string;
  readonly permissions?: readonly string[];
  readonly type: TokenType;
  readonly iat?: number;
  readonly exp?: number;
  readonly iss?: string;
  readonly aud?: string;
}

/**
 * Safe, sanitized authenticated user profile stored in Request and RequestContext.
 */
export interface AuthUser {
  readonly userId: string;
  readonly sessionId?: string;
  readonly email?: string;
  readonly accountType?: string;
  readonly role?: string;
  readonly permissions: readonly string[];
}

/**
 * Active tenant context attached to request and context store.
 */
export interface TenantContextData {
  organizationId?: string;
  organizationRole?: string;
  workspaceId?: string;
  workspaceRole?: string;
}

/**
 * Express Request decorated with authenticated user credentials and tenant context.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  token?: string;
  tenantContext?: TenantContextData;
}

/**
 * Pair of issued access and refresh JWT tokens.
 */
export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
}
