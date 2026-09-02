import { FeatureFlagStatus } from "@prisma/client";
import { z } from "zod";

export const updateWebsiteSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  allowNewApplications: z.boolean().optional(),
  allowClientRequests: z.boolean().optional(),
  allowAIAssistant: z.boolean().optional(),
  allowMemberApplications: z.boolean().optional(),
  defaultLanguage: z.string().trim().min(2).max(10).optional(),
  timezone: z.string().trim().min(2).max(50).optional(),
});

export const updateSEOSettingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(150).optional(),
  siteDescription: z.string().trim().min(1).max(500).optional(),
  keywords: z.string().trim().max(500).optional(),
  canonicalUrl: z.string().trim().url().nullable().optional(),
  ogImage: z.string().trim().url().nullable().optional(),
});

export const updateCompanyProfileSchema = z.object({
  companyName: z.string().trim().min(1).max(150).optional(),
  legalName: z.string().trim().max(150).nullable().optional(),
  tagline: z.string().trim().max(255).nullable().optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  mission: z.string().trim().max(2000).nullable().optional(),
  vision: z.string().trim().max(2000).nullable().optional(),
  foundedYear: z.number().int().min(1800).max(2100).nullable().optional(),
  email: z.string().trim().email().optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  website: z.string().trim().url().nullable().optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),
});

export const systemConfigParamSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Config key must be at least 2 characters")
    .max(100)
    .regex(/^[A-Za-z0-9_.-]+$/, "Config key contains invalid characters"),
});

export const upsertSystemConfigSchema = z.object({
  configValue: z.string().trim().max(5000, "Config value exceeds max length"),
  description: z.string().trim().max(1000).optional(),
});

export const featureFlagParamSchema = z.object({
  key: z.string().trim().min(2).max(100),
});

export const updateFeatureFlagSchema = z.object({
  displayName: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  status: z.nativeEnum(FeatureFlagStatus).optional(),
  enabled: z.boolean().optional(),
});

export type UpdateWebsiteSettingsInputSchema = z.infer<typeof updateWebsiteSettingsSchema>;
export type UpdateSEOSettingsInputSchema = z.infer<typeof updateSEOSettingsSchema>;
export type UpdateCompanyProfileInputSchema = z.infer<typeof updateCompanyProfileSchema>;
export type SystemConfigParamInput = z.infer<typeof systemConfigParamSchema>;
export type UpsertSystemConfigInputSchema = z.infer<typeof upsertSystemConfigSchema>;
export type FeatureFlagParamInput = z.infer<typeof featureFlagParamSchema>;
export type UpdateFeatureFlagInputSchema = z.infer<typeof updateFeatureFlagSchema>;
