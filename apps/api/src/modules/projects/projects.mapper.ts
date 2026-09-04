import {
  ProjectClientSummary,
  ProjectDetailResponse,
  ProjectModuleResponse,
  ProjectRequirementResponse,
  ProjectSummaryResponse,
  ProjectUpdateSummary,
  ProjectUserSummary,
} from "./projects.types.js";

/**
 * Maps raw client relation into clean project client summary DTO.
 */
export function sanitizeProjectClient(clientRecord: any): ProjectClientSummary | null {
  if (!clientRecord) return null;
  return {
    id: clientRecord.id,
    fullName: clientRecord.fullName,
    companyName: clientRecord.companyName || null,
    email: clientRecord.email,
    phoneNumber: clientRecord.phoneNumber,
  };
}

/**
 * Maps raw user relation into clean project user summary DTO.
 */
export function sanitizeProjectUser(userRecord: any): ProjectUserSummary | null {
  if (!userRecord) return null;
  const profile = userRecord.profile || {};
  const fullName = profile.fullName || (userRecord.email ? userRecord.email.split("@")[0] : null);

  return {
    id: userRecord.id,
    email: userRecord.email || "",
    fullName: fullName || null,
    profileImage: profile.profileImage || null,
  };
}

/**
 * Maps raw project update record into clean update summary DTO.
 */
export function sanitizeProjectUpdate(updateRecord: any): ProjectUpdateSummary {
  return {
    id: updateRecord.id,
    projectId: updateRecord.projectId,
    title: updateRecord.title,
    description: updateRecord.description || null,
    updateType: updateRecord.updateType || "DAILY_UPDATE",
    blockers: updateRecord.blockers || null,
    nextSteps: updateRecord.nextSteps || null,
    progressPercentage: updateRecord.progressPercentage ?? 0,
    createdAt: updateRecord.createdAt,
    createdBy: sanitizeProjectUser(updateRecord.createdBy),
  };
}

/**
 * Maps raw project module record into clean project module DTO.
 */
export function sanitizeProjectModule(moduleRecord: any): ProjectModuleResponse {
  return {
    id: moduleRecord.id,
    projectId: moduleRecord.projectId,
    title: moduleRecord.title,
    description: moduleRecord.description || null,
    orderIndex: moduleRecord.orderIndex ?? 0,
    status: moduleRecord.status || "PENDING",
    progressPercentage: moduleRecord.progressPercentage ?? 0,
    startDate: moduleRecord.startDate || null,
    targetDate: moduleRecord.targetDate || null,
    completedAt: moduleRecord.completedAt || null,
    createdAt: moduleRecord.createdAt,
    updatedAt: moduleRecord.updatedAt,
  };
}

/**
 * Maps raw project record into clean project summary DTO.
 */
export function sanitizeProjectResponse(project: any): ProjectSummaryResponse {
  return {
    id: project.id,
    title: project.title,
    description: project.description || null,
    category: project.category || null,
    currency: project.currency || "USD",
    budget: project.budget !== undefined && project.budget !== null ? Number(project.budget) : null,
    progressPercentage: project.progressPercentage ?? 0,
    stagingUrl: project.stagingUrl || null,
    productionUrl: project.productionUrl || null,
    repositoryUrl: project.repositoryUrl || null,
    figmaUrl: project.figmaUrl || null,
    documentationUrl: project.documentationUrl || null,
    projectStatus: project.projectStatus,
    startDate: project.startDate || null,
    expectedCompletionDate: project.expectedCompletionDate || null,
    completedDate: project.completedDate || null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    client: sanitizeProjectClient(project.client),
    createdBy: sanitizeProjectUser(project.createdBy),
    manager: sanitizeProjectUser(project.manager),
    member: sanitizeProjectUser(project.member),
  };
}

/**
 * Maps raw project requirement record into clean project requirement DTO.
 */
export function sanitizeProjectRequirement(reqRecord: any): ProjectRequirementResponse {
  return {
    id: reqRecord.id,
    projectId: reqRecord.projectId,
    title: reqRecord.title,
    description: reqRecord.description || null,
    priority: reqRecord.priority || "MEDIUM",
    status: reqRecord.status || "PENDING",
    isCompleted: Boolean(reqRecord.isCompleted),
    dueDate: reqRecord.dueDate || null,
    completedAt: reqRecord.completedAt || null,
    createdAt: reqRecord.createdAt,
    updatedAt: reqRecord.updatedAt,
  };
}

/**
 * Maps raw project record with detailed relations into clean detail DTO.
 */
export function sanitizeProjectDetailResponse(project: any): ProjectDetailResponse {
  const summary = sanitizeProjectResponse(project);
  const updates = project.updates || [];
  const payments = project.payments || [];
  const modules = project.modules || [];
  const requirements = project.requirements || [];

  return {
    ...summary,
    updatesCount: project._count?.updates ?? updates.length,
    paymentsCount: project._count?.payments ?? payments.length,
    modulesCount: project._count?.modules ?? modules.length,
    requirementsCount: project._count?.requirements ?? requirements.length,
    modules: modules.map(sanitizeProjectModule),
    requirements: requirements.map(sanitizeProjectRequirement),
    recentUpdates: updates.map(sanitizeProjectUpdate),
  };
}
