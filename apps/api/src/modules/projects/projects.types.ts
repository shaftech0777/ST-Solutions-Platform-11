import { ProjectStatus } from "@prisma/client";

export interface ProjectQueryFilters {
  organizationId?: string;
  workspaceId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
  assignedManagerId?: string;
  assignedMemberId?: string;
  createdById?: string;
  category?: string;
  sortBy?: "createdAt" | "title" | "projectStatus" | "budget" | "startDate" | "expectedCompletionDate";
  sortOrder?: "asc" | "desc";
}

export interface ProjectClientSummary {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phoneNumber: string;
}

export interface ProjectUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
}

export interface ProjectModuleResponse {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  status: string;
  progressPercentage: number;
  startDate: Date | null;
  targetDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectModuleInput {
  title: string;
  description?: string;
  orderIndex?: number;
  status?: string;
  progressPercentage?: number;
  startDate?: string | Date;
  targetDate?: string | Date;
}

export interface UpdateProjectModuleInput {
  title?: string;
  description?: string;
  orderIndex?: number;
  status?: string;
  progressPercentage?: number;
  startDate?: string | Date | null;
  targetDate?: string | Date | null;
  completedAt?: string | Date | null;
}

export interface ReorderProjectModulesInput {
  modules: Array<{
    id: string;
    orderIndex: number;
  }>;
}

export interface ProjectUpdateSummary {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  updateType?: string;
  blockers?: string | null;
  nextSteps?: string | null;
  progressPercentage: number;
  createdAt: Date;
  createdBy: ProjectUserSummary | null;
}

export interface ProjectSummaryResponse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  currency: string;
  budget: number | null;
  progressPercentage: number;
  stagingUrl: string | null;
  productionUrl: string | null;
  repositoryUrl: string | null;
  figmaUrl: string | null;
  documentationUrl: string | null;
  projectStatus: ProjectStatus;
  startDate: Date | null;
  expectedCompletionDate: Date | null;
  completedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client: ProjectClientSummary | null;
  createdBy: ProjectUserSummary | null;
  manager: ProjectUserSummary | null;
  member: ProjectUserSummary | null;
}

export interface ProjectDetailResponse extends ProjectSummaryResponse {
  updatesCount: number;
  paymentsCount: number;
  modulesCount?: number;
  modules?: ProjectModuleResponse[];
  recentUpdates: ProjectUpdateSummary[];
}

export interface CreateProjectInput {
  organizationId?: string;
  workspaceId?: string;
  clientId: string;
  title: string;
  description?: string;
  category?: string;
  currency?: string;
  budget?: number;
  progressPercentage?: number;
  stagingUrl?: string;
  productionUrl?: string;
  repositoryUrl?: string;
  figmaUrl?: string;
  documentationUrl?: string;
  projectStatus?: ProjectStatus;
  assignedManagerId?: string;
  assignedMemberId?: string;
  startDate?: string | Date;
  expectedCompletionDate?: string | Date;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  category?: string;
  currency?: string;
  budget?: number;
  progressPercentage?: number;
  stagingUrl?: string | null;
  productionUrl?: string | null;
  repositoryUrl?: string | null;
  figmaUrl?: string | null;
  documentationUrl?: string | null;
  clientId?: string;
  assignedManagerId?: string | null;
  assignedMemberId?: string | null;
  startDate?: string | Date | null;
  expectedCompletionDate?: string | Date | null;
  completedDate?: string | Date | null;
}

export interface UpdateProjectStatusInput {
  projectStatus: ProjectStatus;
}

export interface UpdateProjectOwnershipInput {
  assignedManagerId?: string | null;
  assignedMemberId?: string | null;
}

export interface CreateProjectUpdateInput {
  title: string;
  description?: string;
  updateType?: string;
  blockers?: string;
  nextSteps?: string;
  progressPercentage?: number;
}

export interface UpdateProjectUpdateInput {
  title?: string;
  description?: string;
  updateType?: string;
  blockers?: string;
  nextSteps?: string;
  progressPercentage?: number;
}

export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  projectsByStatus: Array<{
    status: ProjectStatus;
    count: number;
  }>;
  recentlyCreatedCount: number;
  assignedProjectsCount: number;
  unassignedProjectsCount: number;
  totalBudget: number;
}
