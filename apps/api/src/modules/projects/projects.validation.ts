import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
});

export const projectUpdateParamsSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
  updateId: z.string().uuid("Invalid update ID format"),
});

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  clientId: z.string().uuid().optional(),
  assignedManagerId: z.string().uuid().optional(),
  assignedMemberId: z.string().uuid().optional(),
  createdById: z.string().uuid().optional(),
  category: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title", "projectStatus", "budget", "startDate", "expectedCompletionDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const projectModuleParamsSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
  moduleId: z.string().uuid("Invalid module ID format"),
});

export const createProjectSchema = z.object({
  clientId: z.string().uuid("Invalid client ID format"),
  title: z.string().trim().min(2, "Project title is required").max(150),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(100).optional(),
  currency: z.string().trim().max(10).optional().default("USD"),
  budget: z.coerce.number().nonnegative("Budget cannot be negative").optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional().default(0),
  stagingUrl: z.string().url().nullable().optional(),
  productionUrl: z.string().url().nullable().optional(),
  repositoryUrl: z.string().url().nullable().optional(),
  figmaUrl: z.string().url().nullable().optional(),
  documentationUrl: z.string().url().nullable().optional(),
  projectStatus: z.nativeEnum(ProjectStatus).optional(),
  assignedManagerId: z.string().uuid("Invalid manager ID format").optional(),
  assignedMemberId: z.string().uuid("Invalid member ID format").optional(),
  startDate: z.coerce.date().optional(),
  expectedCompletionDate: z.coerce.date().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(100).optional(),
  currency: z.string().trim().max(10).optional(),
  budget: z.coerce.number().nonnegative("Budget cannot be negative").optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
  stagingUrl: z.string().url().nullable().optional(),
  productionUrl: z.string().url().nullable().optional(),
  repositoryUrl: z.string().url().nullable().optional(),
  figmaUrl: z.string().url().nullable().optional(),
  documentationUrl: z.string().url().nullable().optional(),
  clientId: z.string().uuid("Invalid client ID format").optional(),
  assignedManagerId: z.string().uuid("Invalid manager ID format").nullable().optional(),
  assignedMemberId: z.string().uuid("Invalid member ID format").nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  expectedCompletionDate: z.coerce.date().nullable().optional(),
  completedDate: z.coerce.date().nullable().optional(),
});

export const updateProjectStatusSchema = z.object({
  projectStatus: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: "Invalid project status" }),
  }),
});

export const updateProjectOwnershipSchema = z.object({
  assignedManagerId: z.string().uuid("Invalid manager ID format").nullable().optional(),
  assignedMemberId: z.string().uuid("Invalid member ID format").nullable().optional(),
});

export const createProjectModuleSchema = z.object({
  title: z.string().trim().min(2, "Module title is required").max(150),
  description: z.string().trim().max(2000).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional().default("PENDING"),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional().default(0),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
});

export const updateProjectModuleSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
  startDate: z.coerce.date().nullable().optional(),
  targetDate: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
});

export const reorderProjectModulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string().uuid("Invalid module ID"),
      orderIndex: z.coerce.number().int().min(0),
    })
  ).min(1, "At least one module order must be specified"),
});

export const createProjectUpdateSchema = z.object({
  title: z.string().trim().min(2, "Update title is required").max(150),
  description: z.string().trim().max(2000).optional(),
  updateType: z.string().trim().max(50).optional().default("DAILY_UPDATE"),
  blockers: z.string().trim().max(2000).optional(),
  nextSteps: z.string().trim().max(2000).optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).default(0),
});

export const updateProjectUpdateSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  updateType: z.string().trim().max(50).optional(),
  blockers: z.string().trim().max(2000).optional(),
  nextSteps: z.string().trim().max(2000).optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
});

export type ProjectIdParamInput = z.infer<typeof projectIdParamSchema>;
export type ProjectUpdateParamsInput = z.infer<typeof projectUpdateParamsSchema>;
export type ProjectModuleParamsInput = z.infer<typeof projectModuleParamsSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type CreateProjectInputSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectInputSchema = z.infer<typeof updateProjectSchema>;
export type UpdateProjectStatusInputSchema = z.infer<typeof updateProjectStatusSchema>;
export type UpdateProjectOwnershipInputSchema = z.infer<typeof updateProjectOwnershipSchema>;
export type CreateProjectModuleInputSchema = z.infer<typeof createProjectModuleSchema>;
export type UpdateProjectModuleInputSchema = z.infer<typeof updateProjectModuleSchema>;
export type ReorderProjectModulesInputSchema = z.infer<typeof reorderProjectModulesSchema>;
export type CreateProjectUpdateInputSchema = z.infer<typeof createProjectUpdateSchema>;
export type UpdateProjectUpdateInputSchema = z.infer<typeof updateProjectUpdateSchema>;
