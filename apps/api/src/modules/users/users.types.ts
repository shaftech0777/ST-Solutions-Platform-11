import { AccountType, UserStatus } from "@prisma/client";

/**
 * Filter and pagination query parameters for listing users.
 */
export interface UserQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly status?: UserStatus;
  readonly accountType?: AccountType;
  readonly roleId?: string;
  readonly sortBy?: "createdAt" | "email" | "updatedAt" | "status" | "accountType";
  readonly sortOrder?: "asc" | "desc";
}

/**
 * Safe user response representation excluding credentials.
 */
export interface UserProfileData {
  readonly fullName: string | null;
  readonly profileImage: string | null;
  readonly phoneNumber: string | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly address: string | null;
}

export interface UserResponse {
  readonly id: string;
  readonly email: string | null;
  readonly accountType: AccountType;
  readonly status: UserStatus;
  readonly roleId: string | null;
  readonly roleName?: string;
  readonly permissions: readonly string[];
  readonly profile?: UserProfileData | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
