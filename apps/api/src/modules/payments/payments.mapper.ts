import {
  PaymentClientSummary,
  PaymentProjectSummary,
  PaymentResponse,
  PaymentUserSummary,
} from "./payments.types.js";

/**
 * Maps raw client relation into clean payment client summary DTO.
 */
export function sanitizePaymentClient(clientRecord: any): PaymentClientSummary | null {
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
 * Maps raw project relation into clean payment project summary DTO.
 */
export function sanitizePaymentProject(projectRecord: any): PaymentProjectSummary | null {
  if (!projectRecord) return null;
  return {
    id: projectRecord.id,
    title: projectRecord.title,
    category: projectRecord.category || null,
    projectStatus: projectRecord.projectStatus,
  };
}

/**
 * Maps raw user relation into clean payment user summary DTO.
 */
export function sanitizePaymentUser(userRecord: any): PaymentUserSummary | null {
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
 * Maps raw payment record into clean payment response DTO.
 */
export function sanitizePaymentResponse(payment: any): PaymentResponse {
  return {
    id: payment.id,
    clientId: payment.clientId,
    projectId: payment.projectId || null,
    amount: payment.amount !== undefined && payment.amount !== null ? Number(payment.amount) : 0,
    currency: payment.currency || "USD",
    paymentMethod: payment.paymentMethod || null,
    transactionReference: payment.transactionReference || null,
    paymentStatus: payment.paymentStatus,
    approvedById: payment.approvedById || null,
    approvalNotes: payment.approvalNotes || null,
    submittedAt: payment.submittedAt || null,
    approvedAt: payment.approvedAt || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    client: sanitizePaymentClient(payment.client),
    project: sanitizePaymentProject(payment.project),
    approvedBy: sanitizePaymentUser(payment.approvedBy),
  };
}
