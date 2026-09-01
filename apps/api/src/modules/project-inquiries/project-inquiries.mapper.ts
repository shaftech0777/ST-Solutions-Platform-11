import { ProjectInquiryResponse, ProjectInquiryActivityResponse } from "./project-inquiries.types.js";

export function sanitizeProjectInquiryActivity(activity: any): ProjectInquiryActivityResponse {
  return {
    id: activity.id,
    inquiryId: activity.inquiryId,
    userId: activity.userId || null,
    userName: activity.user?.profile?.fullName || activity.user?.email || null,
    action: activity.action,
    contactMethod: activity.contactMethod || null,
    details: activity.details || null,
    createdAt: activity.createdAt,
  };
}

export function sanitizeProjectInquiryResponse(inquiry: any): ProjectInquiryResponse {
  return {
    id: inquiry.id,
    visitorName: inquiry.visitorName,
    email: inquiry.email,
    phone: inquiry.phone,
    companyName: inquiry.companyName || null,
    country: inquiry.country || null,
    projectId: inquiry.projectId || null,
    projectNameSnapshot: inquiry.projectNameSnapshot,
    category: inquiry.category || null,
    message: inquiry.message,
    preferredContactMethod: inquiry.preferredContactMethod || "WHATSAPP",
    budget: inquiry.budget || null,
    preferredContactTime: inquiry.preferredContactTime || null,
    status: inquiry.status || "NEW",
    priority: inquiry.priority || "NORMAL",
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    contactedAt: inquiry.contactedAt || null,
    contactedById: inquiry.contactedById || null,
    contactedByName: inquiry.contactedBy?.profile?.fullName || inquiry.contactedBy?.email || null,
    adminNotes: inquiry.adminNotes || null,
    activities: Array.isArray(inquiry.activities)
      ? inquiry.activities.map(sanitizeProjectInquiryActivity)
      : undefined,
  };
}

/**
 * Public response sanitizer - does not expose internal admin notes or user relations.
 */
export function sanitizePublicInquirySubmissionResponse(inquiry: any) {
  return {
    id: inquiry.id,
    visitorName: inquiry.visitorName,
    projectNameSnapshot: inquiry.projectNameSnapshot,
    category: inquiry.category || null,
    preferredContactMethod: inquiry.preferredContactMethod,
    createdAt: inquiry.createdAt,
    status: inquiry.status,
  };
}
