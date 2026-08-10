import { z } from "zod";
import { ClientRequestStatus } from "./client-requests.types.js";

export const clientRequestIdParamSchema = z.object({
  requestId: z.string().uuid("Invalid client request ID format"),
});

export const clientRequestQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.string().trim().toUpperCase().optional(),
  country: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "fullName", "email", "status", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createClientRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address format"),
  phoneNumber: z.string().trim().max(30).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(5000),
  country: z.string().trim().max(100).optional(),
  status: z.nativeEnum(ClientRequestStatus).optional().default(ClientRequestStatus.PENDING),
});

export const updateClientRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  phoneNumber: z.string().trim().max(30).nullable().optional(),
  whatsappNumber: z.string().trim().max(30).nullable().optional(),
  message: z.string().trim().min(5).max(5000).optional(),
  country: z.string().trim().max(100).nullable().optional(),
  status: z.nativeEnum(ClientRequestStatus).optional(),
});

export const updateClientRequestStatusSchema = z.object({
  status: z.nativeEnum(ClientRequestStatus, {
    errorMap: () => ({ message: "Invalid client request status" }),
  }),
  notes: z.string().trim().max(1000).optional(),
});

export const convertClientRequestSchema = z.object({
  companyName: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),
  businessType: z.string().trim().max(100).optional(),
  businessDescription: z.string().trim().max(1000).optional(),
});

export type ClientRequestIdParamInput = z.infer<typeof clientRequestIdParamSchema>;
export type ClientRequestQueryInput = z.infer<typeof clientRequestQuerySchema>;
export type CreateClientRequestInputSchema = z.infer<typeof createClientRequestSchema>;
export type UpdateClientRequestInputSchema = z.infer<typeof updateClientRequestSchema>;
export type UpdateClientRequestStatusInputSchema = z.infer<typeof updateClientRequestStatusSchema>;
export type ConvertClientRequestInputSchema = z.infer<typeof convertClientRequestSchema>;
