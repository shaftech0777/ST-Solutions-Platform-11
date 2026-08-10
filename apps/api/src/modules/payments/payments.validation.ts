import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID format"),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.string().trim().optional(),
  currency: z.string().trim().toUpperCase().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "amount", "paymentStatus", "submittedAt", "approvedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createPaymentSchema = z.object({
  clientId: z.string().uuid("Invalid client ID format"),
  projectId: z.string().uuid("Invalid project ID format").optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.string().trim().toUpperCase().min(3).max(10).default("USD"),
  paymentMethod: z.string().trim().max(50).optional(),
  transactionReference: z.string().trim().max(100).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  approvalNotes: z.string().trim().max(1000).optional(),
  submittedAt: z.coerce.date().optional(),
});

export const updatePaymentSchema = z.object({
  clientId: z.string().uuid("Invalid client ID format").optional(),
  projectId: z.string().uuid("Invalid project ID format").nullable().optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero").optional(),
  currency: z.string().trim().toUpperCase().min(3).max(10).optional(),
  paymentMethod: z.string().trim().max(50).nullable().optional(),
  transactionReference: z.string().trim().max(100).nullable().optional(),
  approvalNotes: z.string().trim().max(1000).nullable().optional(),
  submittedAt: z.coerce.date().nullable().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus, {
    errorMap: () => ({ message: "Invalid payment status" }),
  }),
  approvalNotes: z.string().trim().max(1000).optional(),
});

export type PaymentIdParamInput = z.infer<typeof paymentIdParamSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
export type CreatePaymentInputSchema = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInputSchema = z.infer<typeof updatePaymentSchema>;
export type UpdatePaymentStatusInputSchema = z.infer<typeof updatePaymentStatusSchema>;
