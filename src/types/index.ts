export type ThemeMode = "dark" | "light";

export type AccountType = "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export type WorkspaceRole = "ADMIN" | "MEMBER" | "VIEWER";

export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED";

export type ApplicantStatus = "RECEIVED" | "UNDER_REVIEW" | "INTERVIEWED" | "ACCEPTED" | "REJECTED";

export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string | null;
  profileImage?: string | null;
  phoneNumber?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
}

export interface User {
  id: string;
  email: string;
  accountType: AccountType;
  status: UserStatus;
  roleId?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile | null;
  role?: {
    id: string;
    name: string;
    description?: string | null;
    permissions?: Array<{
      permission: {
        id: string;
        name: string;
        description?: string | null;
      };
    }>;
  } | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: OrganizationRole;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: WorkspaceRole;
}

export interface Client {
  id: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  clientId: string;
  title: string;
  description?: string | null;
  projectStatus: ProjectStatus;
  budget?: number | null;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    companyName: string;
    contactName: string;
  };
}

export interface Payment {
  id: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  projectId: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
  };
}

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  positionApplied: string;
  status: ApplicantStatus;
  resumeUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any> | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  description?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    profile?: {
      fullName?: string | null;
    } | null;
  } | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  organizations?: Organization[];
  workspaces?: Workspace[];
}
