import { MemberStatus, RankChangeReason } from "@prisma/client";
import { z } from "zod";

export const memberIdParamSchema = z.object({
  memberId: z.string().uuid("Invalid member ID format"),
});

export const memberQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.nativeEnum(MemberStatus).optional(),
  rankId: z.string().uuid().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  managerId: z.string().uuid().optional(),
  sortBy: z.enum(["createdAt", "joinedAt", "trustScore", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateMemberProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  phoneNumber: z.string().trim().min(5).max(30).optional(),
  profileImage: z.string().url().or(z.literal("")).optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),
  bio: z.string().trim().max(500).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  linkedinUrl: z.string().url().or(z.literal("")).optional(),
  instagramUrl: z.string().url().or(z.literal("")).optional(),
  facebookUrl: z.string().url().or(z.literal("")).optional(),
  tiktokUrl: z.string().url().or(z.literal("")).optional(),
  githubUrl: z.string().url().or(z.literal("")).optional(),
});

export const updateMemberStatusSchema = z.object({
  status: z.nativeEnum(MemberStatus, {
    errorMap: () => ({ message: "Invalid member status" }),
  }),
  notes: z.string().trim().max(500).optional(),
});

export const updateMemberRankSchema = z.object({
  rankId: z.string().uuid("Invalid rank ID format"),
  reason: z.nativeEnum(RankChangeReason, {
    errorMap: () => ({ message: "Invalid rank change reason" }),
  }),
  notes: z.string().trim().max(500).optional(),
});

export type MemberIdParamInput = z.infer<typeof memberIdParamSchema>;
export type MemberQueryInput = z.infer<typeof memberQuerySchema>;
export type UpdateMemberProfileInputSchema = z.infer<typeof updateMemberProfileSchema>;
export type UpdateMemberStatusInputSchema = z.infer<typeof updateMemberStatusSchema>;
export type UpdateMemberRankInputSchema = z.infer<typeof updateMemberRankSchema>;
