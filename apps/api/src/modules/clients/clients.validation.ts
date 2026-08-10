import { ClientStatus } from "@prisma/client";
import { z } from "zod";

export const clientIdParamSchema = z.object({
  clientId: z.string().uuid("Invalid client ID format"),
});

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  businessType: z.string().trim().optional(),
  assignedManagerId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),
  sortBy: z.enum(["createdAt", "fullName", "companyName", "clientStatus"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createClientSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address format"),
  phoneNumber: z.string().trim().min(5, "Phone number is required").max(30),
  companyName: z.string().trim().max(100).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),
  businessType: z.string().trim().max(100).optional(),
  businessDescription: z.string().trim().max(1000).optional(),
  clientStatus: z.nativeEnum(ClientStatus).optional(),
  memberId: z.string().uuid("Invalid member ID").optional(),
  assignedManagerId: z.string().uuid("Invalid manager ID").optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateClientSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email("Invalid email address format").optional(),
  phoneNumber: z.string().trim().min(5).max(30).optional(),
  companyName: z.string().trim().max(100).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),
  profileImage: z.string().url().or(z.literal("")).optional(),
  businessType: z.string().trim().max(100).optional(),
  businessDescription: z.string().trim().max(1000).optional(),
});

export const updateClientStatusSchema = z.object({
  clientStatus: z.nativeEnum(ClientStatus, {
    errorMap: () => ({ message: "Invalid client status" }),
  }),
  notes: z.string().trim().max(500).optional(),
});

export const updateClientOwnershipSchema = z.object({
  memberId: z.string().uuid("Invalid member ID format"),
  assignedManagerId: z.string().uuid("Invalid manager ID format").optional(),
  notes: z.string().trim().max(500).optional(),
});

export type ClientIdParamInput = z.infer<typeof clientIdParamSchema>;
export type ClientQueryInput = z.infer<typeof clientQuerySchema>;
export type CreateClientInputSchema = z.infer<typeof createClientSchema>;
export type UpdateClientInputSchema = z.infer<typeof updateClientSchema>;
export type UpdateClientStatusInputSchema = z.infer<typeof updateClientStatusSchema>;
export type UpdateClientOwnershipInputSchema = z.infer<typeof updateClientOwnershipSchema>;
