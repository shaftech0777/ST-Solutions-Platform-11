import { AccountType, UserStatus } from "@prisma/client";
import { z } from "zod";
import { emailSchema, paginationQuerySchema, passwordSchema } from "../../core/validation/validation.schema.js";

/**
 * Parameter validation for User ID route parameters.
 */
export const userIdParamSchema = z.object({
  id: z.string({ required_error: "User ID is required" }).min(1, { message: "User ID cannot be empty" }),
});

/**
 * Filter and search query parameters validation schema for listing users.
 */
export const userQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  accountType: z.nativeEnum(AccountType).optional(),
  roleId: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "email", "updatedAt", "status", "accountType"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Create user request body validation schema.
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  accountType: z.nativeEnum(AccountType).optional().default(AccountType.MEMBER),
  status: z.nativeEnum(UserStatus).optional().default(UserStatus.PENDING),
  roleId: z.string().trim().nullable().optional(),
  profile: z
    .object({
      fullName: z.string().trim().min(1, "Full name cannot be empty").optional(),
      profileImage: z.string().trim().nullable().optional(),
      phoneNumber: z.string().trim().nullable().optional(),
      country: z.string().trim().nullable().optional(),
      city: z.string().trim().nullable().optional(),
      address: z.string().trim().nullable().optional(),
    })
    .optional(),
});

/**
 * Update user request body validation schema.
 */
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  profile: z
    .object({
      fullName: z.string().trim().min(1, "Full name cannot be empty").optional().nullable(),
      profileImage: z.string().trim().nullable().optional(),
      phoneNumber: z.string().trim().nullable().optional(),
      country: z.string().trim().nullable().optional(),
      city: z.string().trim().nullable().optional(),
      address: z.string().trim().nullable().optional(),
    })
    .optional(),
});

/**
 * Update user status request body validation schema.
 */
export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    required_error: "User status is required",
    invalid_type_error: "Invalid user status value",
  }),
});

/**
 * Update user role/accountType request body validation schema.
 */
export const updateUserRoleSchema = z
  .object({
    roleId: z.string().trim().nullable().optional(),
    accountType: z.nativeEnum(AccountType).optional(),
  })
  .refine((data) => data.roleId !== undefined || data.accountType !== undefined, {
    message: "At least one of 'roleId' or 'accountType' must be provided",
  });

export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
