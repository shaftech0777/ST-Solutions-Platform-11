export enum ClientRequestStatus {
  PENDING = "PENDING",
  IN_REVIEW = "IN_REVIEW",
  CONTACTED = "CONTACTED",
  CONVERTED = "CONVERTED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

export interface ClientRequestQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "fullName" | "email" | "status" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ClientRequestResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  message: string;
  country: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequestInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  message: string;
  country?: string;
  status?: string;
}

export interface UpdateClientRequestInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  message?: string;
  country?: string | null;
  status?: string;
}

export interface UpdateClientRequestStatusInput {
  status: string;
  notes?: string;
}

export interface ConvertClientRequestInput {
  companyName?: string;
  city?: string;
  address?: string;
  businessType?: string;
  businessDescription?: string;
}

export interface ClientRequestStatistics {
  totalRequests: number;
  pendingRequests: number;
  inReviewRequests: number;
  contactedRequests: number;
  convertedRequests: number;
  rejectedRequests: number;
  archivedRequests: number;
  recentRequestsTotal: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  countryBreakdown: Array<{
    country: string;
    count: number;
  }>;
}
