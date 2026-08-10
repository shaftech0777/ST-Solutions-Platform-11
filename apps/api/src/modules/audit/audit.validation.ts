import { z } from "zod";

export const auditLogIdParamSchema = z.object({
  auditId: z.string().uuid("Invalid audit log ID format"),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  userId: z.string().trim().uuid().optional(),
  action: z.string().trim().toUpperCase().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "action", "userId"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createAuditLogSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  action: z.string().trim().min(2, "Action name required").max(100),
  description: z.string().trim().max(2000).nullable().optional(),
  ipAddress: z.string().trim().max(100).nullable().optional(),
});

export type AuditLogIdParamInput = z.infer<typeof auditLogIdParamSchema>;
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;
export type CreateAuditLogInputSchema = z.infer<typeof createAuditLogSchema>;
