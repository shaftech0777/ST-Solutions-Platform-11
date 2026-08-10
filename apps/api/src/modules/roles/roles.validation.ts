import { z } from "zod";
import { paginationQuerySchema } from "../../core/validation/validation.schema.js";

/**
 * Route parameter validation schema for Role ID.
 */
export const roleIdParamSchema = z.object({
  roleId: z.string({ required_error: "Role ID is required" }).min(1, { message: "Role ID cannot be empty" }),
});

/**
 * Route parameters validation schema for Role ID and Permission ID.
 */
export const rolePermissionParamsSchema = z.object({
  roleId: z.string({ required_error: "Role ID is required" }).min(1, { message: "Role ID cannot be empty" }),
  permissionId: z
    .string({ required_error: "Permission ID is required" })
    .min(1, { message: "Permission ID cannot be empty" }),
});

/**
 * Query filters and search validation schema for listing roles.
 */
export const roleQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "name", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Role creation request body validation schema.
 */
export const createRoleSchema = z.object({
  name: z
    .string({ required_error: "Role name is required" })
    .trim()
    .min(1, { message: "Role name cannot be empty" })
    .max(50, { message: "Role name cannot exceed 50 characters" }),
  description: z.string().trim().max(255, { message: "Description cannot exceed 255 characters" }).optional(),
  permissionIds: z.array(z.string().trim().min(1)).optional(),
});

/**
 * Role update request body validation schema.
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Role name cannot be empty" })
    .max(50, { message: "Role name cannot exceed 50 characters" })
    .optional(),
  description: z.string().trim().max(255, { message: "Description cannot exceed 255 characters" }).nullable().optional(),
});

/**
 * Assign permissions request body validation schema.
 */
export const assignPermissionsSchema = z
  .object({
    permissionId: z.string().trim().min(1).optional(),
    permissionIds: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((data) => data.permissionId !== undefined || (data.permissionIds !== undefined && data.permissionIds.length > 0), {
    message: "Either 'permissionId' or a non-empty 'permissionIds' array must be provided",
  });

export type RoleQueryInput = z.infer<typeof roleQuerySchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
