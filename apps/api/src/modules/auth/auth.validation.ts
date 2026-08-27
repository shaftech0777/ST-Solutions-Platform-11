import { z } from "zod";
import { AccountType } from "@prisma/client";
import { emailSchema, passwordSchema } from "../../core/validation/validation.schema.js";

/**
 * Registration request validation schema.
 */
export const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name cannot exceed 100 characters" }),
  email: emailSchema,
  password: passwordSchema,
  accountType: z.nativeEnum(AccountType).optional(),
  organizationName: z.string().trim().min(2).max(100).optional(),
});

/**
 * Login request validation schema.
 * Supports Email (Admins/Sub-Admins/Managers/Members) and User ID / Username (Managers/Members).
 */
export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1, { message: "Identifier cannot be empty" }).optional(),
    username: z.string().trim().min(1, { message: "Username cannot be empty" }).optional(),
    userId: z.string().trim().min(1, { message: "User ID cannot be empty" }).optional(),
    email: z.string().trim().optional(),
    password: z.string({ required_error: "Password is required" }).min(1, { message: "Password cannot be empty" }),
  })
  .refine((data) => Boolean(data.identifier || data.username || data.userId || data.email), {
    message: "Email address or User ID is required",
    path: ["identifier"],
  });

/**
 * Refresh token request validation schema.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .trim()
    .min(1, { message: "Refresh token cannot be empty" }),
});

/**
 * Change password request validation schema.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, { message: "Current password cannot be empty" }),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

