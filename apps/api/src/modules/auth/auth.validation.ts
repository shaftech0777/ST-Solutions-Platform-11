import { z } from "zod";
import { emailSchema, passwordSchema } from "../../core/validation/validation.schema.js";

/**
 * Login request validation schema.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: "Password is required" }).min(1, { message: "Password cannot be empty" }),
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

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
