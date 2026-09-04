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

export interface UserHierarchySummary {
  readonly supervisor?: {
    readonly id: string;
    readonly fullName: string | null;
    readonly email: string | null;
    readonly role: string;
  } | null;
  readonly managedUsersCount?: number;
  readonly managedUsers?: readonly {
    readonly id: string;
    readonly fullName: string | null;
    readonly email: string | null;
    readonly role: string;
    readonly status: string;
  }[];
  readonly memberAccount?: {
    readonly id: string;
    readonly rankName?: string | null;
    readonly status?: string;
    readonly managerName?: string | null;
  } | null;
}

export interface UserWorkSummary {
  readonly assignedClientsCount: number;
  readonly activeProjectsCount: number;
  readonly performanceScore?: number | null;
  readonly clients?: readonly {
    readonly id: string;
    readonly fullName: string;
    readonly companyName?: string | null;
    readonly clientStatus: string;
  }[];
}

export interface UserSecuritySummary {
  readonly status: UserStatus;
  readonly suspensionReason?: string | null;
  readonly suspendedAt?: Date | null;
  readonly lastLogin?: Date | null;
  readonly activeSessionsCount?: number;
}

export interface UserResponse {
  readonly id: string;
  readonly email: string | null;
  readonly accountType: AccountType;
  readonly status: UserStatus;
  readonly roleId: string | null;
  readonly roleName?: string;
  readonly permissions: readonly string[];
  readonly createdByUserId?: string | null;
  readonly managedByUserId?: string | null;
  readonly organizationId?: string | null;
  readonly workspaceId?: string | null;
  readonly suspensionReason?: string | null;
  readonly suspendedAt?: Date | null;
  readonly profile?: UserProfileData | null;
  readonly hierarchy?: UserHierarchySummary | null;
  readonly work?: UserWorkSummary | null;
  readonly security?: UserSecuritySummary | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TeamTreeNode {
  id: string;
  type: AccountType | "CLIENT";
  name: string;
  email: string | null;
  loginId: string;
  avatar: string | null;
  status: string;
  phoneNumber?: string | null;
  roleName?: string | null;
  directReportsCount: number;
  clientsCount: number;
  projectsCount: number;
  children: TeamTreeNode[];
  metadata?: {
    supervisorId?: string | null;
    supervisorName?: string | null;
    managerId?: string | null;
    managerName?: string | null;
    memberId?: string | null;
    memberName?: string | null;
    companyName?: string | null;
    createdAt?: Date | string;
    projects?: Array<{
      id: string;
      title: string;
      status: string;
      progress: number;
      budget: number | null;
      currency: string;
    }>;
  };
}
