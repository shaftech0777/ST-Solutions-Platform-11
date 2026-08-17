import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { settingsController } from "./settings.controller.js";
import {
  featureFlagParamSchema,
  systemConfigParamSchema,
  updateCompanyProfileSchema,
  updateFeatureFlagSchema,
  updateSEOSettingsSchema,
  updateWebsiteSettingsSchema,
  upsertSystemConfigSchema,
} from "./settings.validation.js";

export const settingsRouter = Router();

/**
 * @route GET /settings/public
 * @desc Retrieves public site configurations (Website flags, SEO, Company public profile, FeatureFlags)
 * @access Public / Unprotected
 */
settingsRouter.get("/public", settingsController.getPublicSettings);

// Protect remaining administrative settings routes with Authentication
settingsRouter.use(authenticate());

/**
 * @route GET /settings
 * @desc Retrieves platform website settings
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/",
  requirePermission("settings.read"),
  settingsController.getWebsiteSettings
);

/**
 * @route PUT /settings
 * @desc Updates platform website settings
 * @access Protected (Requires settings.update)
 */
settingsRouter.put(
  "/",
  requirePermission("settings.update"),
  settingsController.updateWebsiteSettings
);

/**
 * @route GET /settings/website
 * @desc Retrieves website settings
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/website",
  requirePermission("settings.read"),
  settingsController.getWebsiteSettings
);

/**
 * @route PATCH /settings/website
 * @desc Updates website settings
 * @access Protected (Requires settings.update)
 */
settingsRouter.patch(
  "/website",
  requirePermission("settings.update"),
  validate({ body: updateWebsiteSettingsSchema }),
  settingsController.updateWebsiteSettings
);

/**
 * @route GET /settings/seo
 * @desc Retrieves SEO settings
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/seo",
  requirePermission("settings.read"),
  settingsController.getSEOSettings
);

/**
 * @route PATCH /settings/seo
 * @desc Updates SEO settings
 * @access Protected (Requires settings.update)
 */
settingsRouter.patch(
  "/seo",
  requirePermission("settings.update"),
  validate({ body: updateSEOSettingsSchema }),
  settingsController.updateSEOSettings
);

/**
 * @route GET /settings/company
 * @desc Retrieves company profile
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/company",
  requirePermission("settings.read"),
  settingsController.getCompanyProfile
);

/**
 * @route PATCH /settings/company
 * @desc Updates company profile
 * @access Protected (Requires settings.update)
 */
settingsRouter.patch(
  "/company",
  requirePermission("settings.update"),
  validate({ body: updateCompanyProfileSchema }),
  settingsController.updateCompanyProfile
);

/**
 * @route GET /settings/system-configs
 * @desc Retrieves all platform system configurations
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/system-configs",
  requirePermission("settings.read"),
  settingsController.getSystemConfigs
);

/**
 * @route GET /settings/system-configs/:key
 * @desc Retrieves a single system configuration by key
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/system-configs/:key",
  requirePermission("settings.read"),
  validate({ params: systemConfigParamSchema }),
  settingsController.getSystemConfigByKey
);

/**
 * @route PUT /settings/system-configs/:key
 * @desc Upserts a system configuration key-value pair
 * @access Protected (Requires settings.manage)
 */
settingsRouter.put(
  "/system-configs/:key",
  requirePermission("settings.manage"),
  validate({ params: systemConfigParamSchema, body: upsertSystemConfigSchema }),
  settingsController.upsertSystemConfig
);

/**
 * @route GET /settings/feature-flags
 * @desc Retrieves all feature flags
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/feature-flags",
  requirePermission("settings.read"),
  settingsController.getFeatureFlags
);

/**
 * @route PATCH /settings/feature-flags/:key
 * @desc Updates a feature flag
 * @access Protected (Requires settings.manage)
 */
settingsRouter.patch(
  "/feature-flags/:key",
  requirePermission("settings.manage"),
  validate({ params: featureFlagParamSchema, body: updateFeatureFlagSchema }),
  settingsController.updateFeatureFlag
);
