import { z } from "zod";
import { WorkspaceRole } from "@prisma/client";

export const createWorkspaceSchema = z.object({
  organizationId: z.string().uuid({ message: "Invalid organization ID" }),
  name: z
    .string({ required_error: "Workspace name is required" })
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  description: z.string().trim().max(500).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  isArchived: z.boolean().optional(),
});

export const addWorkspaceMemberSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID" }),
  role: z.nativeEnum(WorkspaceRole).optional().default(WorkspaceRole.MEMBER),
});

export const workspaceIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid workspace ID" }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
