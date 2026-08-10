import {
  ProjectClientSummary,
  ProjectDetailResponse,
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
    progressPercentage: updateRecord.progressPercentage ?? 0,
    createdAt: updateRecord.createdAt,
    createdBy: sanitizeProjectUser(updateRecord.createdBy),
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
    budget: project.budget !== undefined && project.budget !== null ? Number(project.budget) : null,
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
 * Maps raw project record with detailed relations into clean detail DTO.
 */
export function sanitizeProjectDetailResponse(project: any): ProjectDetailResponse {
  const summary = sanitizeProjectResponse(project);
  const updates = project.updates || [];
  const payments = project.payments || [];

  return {
    ...summary,
    updatesCount: project._count?.updates ?? updates.length,
    paymentsCount: project._count?.payments ?? payments.length,
    recentUpdates: updates.map(sanitizeProjectUpdate),
  };
}
