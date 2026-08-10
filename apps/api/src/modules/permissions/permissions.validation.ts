import { z } from "zod";
import { paginationQuerySchema } from "../../core/validation/validation.schema.js";

/**
 * Route parameter validation schema for Permission ID.
 */
export const permissionIdParamSchema = z.object({
  permissionId: z
    .string({ required_error: "Permission ID is required" })
    .min(1, { message: "Permission ID cannot be empty" }),
});

/**
 * Query filters and search validation schema for listing permissions.
 */
export const permissionQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "name", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Permission creation request body validation schema.
 */
export const createPermissionSchema = z.object({
  name: z
    .string({ required_error: "Permission name is required" })
    .trim()
    .min(1, { message: "Permission name cannot be empty" })
    .max(100, { message: "Permission name cannot exceed 100 characters" }),
  description: z.string().trim().max(255, { message: "Description cannot exceed 255 characters" }).optional(),
});

/**
 * Permission update request body validation schema.
 */
export const updatePermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Permission name cannot be empty" })
    .max(100, { message: "Permission name cannot exceed 100 characters" })
    .optional(),
  description: z.string().trim().max(255, { message: "Description cannot exceed 255 characters" }).nullable().optional(),
});

export type PermissionQueryInput = z.infer<typeof permissionQuerySchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
