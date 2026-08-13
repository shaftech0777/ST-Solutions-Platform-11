import { ClientStatus } from "@prisma/client";

export interface ClientQueryFilters {
  organizationId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  country?: string;
  city?: string;
  businessType?: string;
  assignedManagerId?: string;
  memberId?: string;
  sortBy?: "createdAt" | "fullName" | "companyName" | "clientStatus";
  sortOrder?: "asc" | "desc";
}

export interface ClientOwnershipSummary {
  id: string;
  memberId: string;
  memberName: string | null;
  assignedManagerId: string | null;
  managerName: string | null;
  assignedAt: Date;
  notes: string | null;
}

export interface ClientSummaryResponse {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phoneNumber: string;
  whatsappNumber: string | null;
  country: string | null;
  city: string | null;
  businessType: string | null;
  clientStatus: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
  ownership: ClientOwnershipSummary | null;
}

export interface ClientProjectSummary {
  id: string;
  title: string;
  category: string | null;
  budget: number | null;
  projectStatus: string;
  startDate: Date | null;
  expectedCompletionDate: Date | null;
  createdAt: Date;
}

export interface ClientDetailResponse extends ClientSummaryResponse {
  userId: string | null;
  address: string | null;
  profileImage: string | null;
  businessDescription: string | null;
  projectsCount: number;
  paymentsCount: number;
  recentProjects: ClientProjectSummary[];
}

export interface CreateClientInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  whatsappNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  businessType?: string;
  businessDescription?: string;
  clientStatus?: ClientStatus;
  memberId?: string;
  assignedManagerId?: string;
  notes?: string;
}

export interface UpdateClientInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  whatsappNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  profileImage?: string;
  businessType?: string;
  businessDescription?: string;
}

export interface UpdateClientStatusInput {
  clientStatus: ClientStatus;
  notes?: string;
}

export interface UpdateClientOwnershipInput {
  memberId: string;
  assignedManagerId?: string;
  notes?: string;
}

export interface ClientStatistics {
  totalClients: number;
  clientsByStatus: Array<{
    status: ClientStatus;
    count: number;
  }>;
  recentlyAddedCount: number;
  ownedClientsCount: number;
  unassignedClientsCount: number;
}
