import {
  ClientDetailResponse,
  ClientOwnershipSummary,
  ClientProjectSummary,
  ClientSummaryResponse,
} from "./clients.types.js";

/**
 * Maps raw client ownership relation into sanitized ownership summary DTO.
 */
export function sanitizeClientOwnership(ownershipRecord: any): ClientOwnershipSummary | null {
  if (!ownershipRecord) return null;

  const memberUser = ownershipRecord.member?.user || {};
  const memberProfile = memberUser.profile || {};
  const managerUser = ownershipRecord.manager || {};
  const managerProfile = managerUser.profile || {};

  const memberName =
    memberProfile.fullName ||
    (memberUser.email ? memberUser.email.split("@")[0] : null);

  const managerName =
    managerProfile.fullName ||
    (managerUser.email ? managerUser.email.split("@")[0] : null);

  return {
    id: ownershipRecord.id,
    memberId: ownershipRecord.memberId,
    memberName: memberName || null,
    assignedManagerId: ownershipRecord.assignedManagerId || null,
    managerName: managerName || null,
    assignedAt: ownershipRecord.assignedAt,
    notes: ownershipRecord.notes || null,
  };
}

/**
 * Maps raw client record into sanitized client summary response DTO.
 */
export function sanitizeClientResponse(client: any): ClientSummaryResponse {
  return {
    id: client.id,
    fullName: client.fullName,
    companyName: client.companyName || null,
    email: client.email,
    phoneNumber: client.phoneNumber,
    whatsappNumber: client.whatsappNumber || null,
    country: client.country || null,
    city: client.city || null,
    businessType: client.businessType || null,
    clientStatus: client.clientStatus,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    ownership: sanitizeClientOwnership(client.ownership),
  };
}

/**
 * Maps raw project record into concise client project summary.
 */
export function sanitizeClientProject(project: any): ClientProjectSummary {
  return {
    id: project.id,
    title: project.title,
    category: project.category || null,
    budget: project.budget !== undefined && project.budget !== null ? Number(project.budget) : null,
    projectStatus: project.projectStatus,
    startDate: project.startDate || null,
    expectedCompletionDate: project.expectedCompletionDate || null,
    createdAt: project.createdAt,
  };
}

/**
 * Maps raw client record with deep relations into sanitized detail response DTO.
 */
export function sanitizeClientDetailResponse(client: any): ClientDetailResponse {
  const summary = sanitizeClientResponse(client);
  const projects = client.projects || [];
  const payments = client.payments || [];

  return {
    ...summary,
    userId: client.userId || null,
    address: client.address || null,
    profileImage: client.profileImage || null,
    businessDescription: client.businessDescription || null,
    projectsCount: client._count?.projects ?? projects.length,
    paymentsCount: client._count?.payments ?? payments.length,
    recentProjects: projects.map(sanitizeClientProject),
  };
}
