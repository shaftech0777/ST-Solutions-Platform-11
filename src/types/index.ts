export type ThemeMode = "dark" | "light";

export type AccountType = "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export type WorkspaceRole = "ADMIN" | "MEMBER" | "VIEWER";

export type ProjectStatus =
  | "PENDING"
  | "DISCUSSION"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED"
  | "ON_HOLD";

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

export type ClientStatus = "LEAD" | "PROSPECT" | "ACTIVE" | "INACTIVE" | "CHURNED" | "ARCHIVED";

export interface Client {
  id: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  fullName?: string;
  name?: string;
  contactName?: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  businessType?: string | null;
  businessDescription?: string | null;
  clientStatus?: ClientStatus | string;
  status?: string;
  notes?: string | null;
  projectsCount?: number;
  paymentsCount?: number;
  recentProjects?: Array<{
    id: string;
    title: string;
    category?: string | null;
    budget?: number | null;
    projectStatus: string;
    startDate?: string | null;
    expectedCompletionDate?: string | null;
    createdAt: string;
  }>;
  ownership?: {
    id?: string;
    memberId?: string | null;
    memberName?: string | null;
    assignedManagerId?: string | null;
    managerName?: string | null;
    assignedAt?: string;
    notes?: string | null;
  } | null;
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
  category?: string | null;
  projectStatus: ProjectStatus;
  budget?: number | null;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  completedDate?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    companyName?: string | null;
    contactName?: string | null;
    fullName?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface Payment {
  id: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus | string;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  approvedById?: string | null;
  approvalNotes?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    fullName?: string | null;
    companyName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  project?: {
    id: string;
    title: string;
    category?: string | null;
    projectStatus?: string | null;
  } | null;
  approvedBy?: {
    id: string;
    email: string;
    fullName?: string | null;
    profileImage?: string | null;
  } | null;
}

export interface Applicant {
  id: string;
  fullName: string;
  fatherName?: string | null;
  email: string;
  phoneNumber?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  cnicNumber?: string | null;
  currentProfession?: string | null;
  currentQualification?: string | null;
  skillsDescription?: string | null;
  positionApplied?: string | null;
  heardAboutSTSolutions?: string | null;
  joiningPurpose?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  applicationStatus?: ApplicantStatus | string;
  status?: ApplicantStatus | string;
  verificationStatus?: string;
  resumeUrl?: string | null;
  notes?: string | null;
  reviewNotes?: string | null;
  approvalNotes?: string | null;
  rejectionReason?: string | null;
  appliedDate?: string | null;
  createdAt: string;
  updatedAt: string;
  answers?: Array<{
    id: string;
    questionId: string;
    answer: string;
    question?: {
      id: string;
      questionText: string;
      questionType: string;
    };
  }>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  isRead?: boolean;
  priority?: string;
  actionUrl?: string | null;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  data?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: string | null;
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

export type InquiryStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "CONVERTED" | "CLOSED" | "SPAM";
export type InquiryPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type InquiryContactMethod = "WHATSAPP" | "EMAIL" | "PHONE_CALL";

export interface InquiryActivity {
  id: string;
  inquiryId: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  contactMethod?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface ProjectInquiry {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  country?: string | null;
  projectId?: string | null;
  projectNameSnapshot: string;
  category?: string | null;
  message: string;
  preferredContactMethod: InquiryContactMethod;
  budget?: string | null;
  preferredContactTime?: string | null;
  status: InquiryStatus;
  priority: InquiryPriority;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string | null;
  contactedById?: string | null;
  contactedByName?: string | null;
  adminNotes?: string | null;
  activities?: InquiryActivity[];
}

export interface ProjectInquiryStats {
  total: number;
  newCount: number;
  inProgressCount: number;
  contactedCount: number;
  convertedCount: number;
  closedCount: number;
  spamCount: number;
  urgentCount: number;
  byContactMethod: {
    whatsapp: number;
    email: number;
    phoneCall: number;
  };
}

