import { z } from "zod";
import { OrganizationRole, OrganizationStatus } from "@prisma/client";
import { emailSchema } from "../../core/validation/validation.schema.js";

export const createOrganizationSchema = z.object({
  name: z
    .string({ required_error: "Organization name is required" })
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  description: z.string().trim().max(500).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.nativeEnum(OrganizationStatus).optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(OrganizationRole).optional().default(OrganizationRole.MEMBER),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(OrganizationRole, { required_error: "Role is required" }),
});

export const acceptInvitationSchema = z.object({
  token: z
    .string({ required_error: "Invitation token is required" })
    .trim()
    .min(1, { message: "Token cannot be empty" }),
});

export const organizationIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid organization ID" }),
});

export const memberIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid organization ID" }),
  memberId: z.string().uuid({ message: "Invalid member ID" }),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
