import { ClientRequestResponse } from "./client-requests.types.js";

/**
 * Maps raw Prisma ClientRequest record into clean client request response DTO.
 */
export function sanitizeClientRequestResponse(request: any): ClientRequestResponse {
  return {
    id: request.id,
    fullName: request.fullName,
    email: request.email,
    phoneNumber: request.phoneNumber || null,
    whatsappNumber: request.whatsappNumber || null,
    message: request.message,
    country: request.country || null,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}
