import { AccountType, UserStatus } from "@prisma/client";

/**
 * Sanitized user profile returned in authentication responses.
 * Excludes sensitive credential data like passwordHash.
 */
export interface SafeUser {
  readonly id: string;
  readonly email: string | null;
  readonly accountType: AccountType;
  readonly status: UserStatus;
  readonly roleId: string | null;
  readonly roleName?: string;
  readonly permissions: readonly string[];
  readonly profile?: {
    readonly fullName: string | null;
    readonly profileImage: string | null;
    readonly phoneNumber: string | null;
    readonly country: string | null;
    readonly city: string | null;
    readonly address: string | null;
  } | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Successful authentication payload containing tokens and sanitized user info.
 */
export interface AuthTokenPayload {
  readonly user: SafeUser;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: "Bearer";
}

/**
 * Token refresh response payload.
 */
export interface RefreshTokenPayload {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: "Bearer";
}
