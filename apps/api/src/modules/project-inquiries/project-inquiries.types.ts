export type InquiryStatusType = "NEW" | "CONTACTED" | "IN_PROGRESS" | "CONVERTED" | "CLOSED" | "SPAM";
export type InquiryPriorityType = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type InquiryContactMethodType = "WHATSAPP" | "EMAIL" | "PHONE_CALL";

export interface ProjectInquiryActivityResponse {
  id: string;
  inquiryId: string;
  userId: string | null;
  userName?: string | null;
  action: string;
  contactMethod: string | null;
  details: string | null;
  createdAt: Date;
}

export interface ProjectInquiryResponse {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  companyName: string | null;
  country: string | null;
  projectId: string | null;
  projectNameSnapshot: string;
  category: string | null;
  message: string;
  preferredContactMethod: InquiryContactMethodType;
  budget: string | null;
  preferredContactTime: string | null;
  status: InquiryStatusType;
  priority: InquiryPriorityType;
  createdAt: Date;
  updatedAt: Date;
  contactedAt: Date | null;
  contactedById: string | null;
  contactedByName?: string | null;
  adminNotes: string | null;
  activities?: ProjectInquiryActivityResponse[];
}

export interface PublicCreateProjectInquiryInput {
  visitorName: string;
  email: string;
  phone: string;
  companyName?: string;
  country?: string;
  projectId?: string;
  projectNameSnapshot: string;
  category?: string;
  message: string;
  preferredContactMethod?: InquiryContactMethodType;
  budget?: string;
  preferredContactTime?: string;
}

export interface UpdateProjectInquiryInput {
  status?: InquiryStatusType;
  priority?: InquiryPriorityType;
  adminNotes?: string;
  contactedAt?: Date | null;
  contactedById?: string | null;
}

export interface RecordContactAttemptInput {
  contactMethod: InquiryContactMethodType;
  notes?: string;
  updateStatusToContacted?: boolean;
}

export interface AddInquiryNoteInput {
  notes: string;
}

export interface ProjectInquiryQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "visitorName" | "email" | "status" | "priority" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ProjectInquiryStatistics {
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
