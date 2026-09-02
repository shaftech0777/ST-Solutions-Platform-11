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

/**
 * @route GET /settings/cms
 * @desc Retrieves all CMS content sections
 * @access Public
 */
settingsRouter.get("/cms", settingsController.getCMSSections);

/**
 * @route GET /settings/cms/:key
 * @desc Retrieves single CMS section
 * @access Public
 */
settingsRouter.get("/cms/:key", settingsController.getCMSSectionByKey);

/**
 * @route GET /settings/theme
 * @desc Retrieves theme settings
 * @access Public
 */
settingsRouter.get("/theme", settingsController.getThemeSettings);

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
 * @access Protected (Requires settings.update)
 */
settingsRouter.put(
  "/system-configs/:key",
  requirePermission("settings.update"),
  validate({ params: systemConfigParamSchema, body: upsertSystemConfigSchema }),
  settingsController.upsertSystemConfig
);

/**
 * @route GET /settings/features
 * @desc Retrieves feature toggles dictionary map (e.g. { ai_copilot: true, ... })
 * @access Protected (Requires settings.read)
 */
settingsRouter.get(
  "/features",
  requirePermission("settings.read"),
  settingsController.getFeaturesMap
);

/**
 * @route PATCH /settings/features/:key
 * @desc Updates a feature flag status or configuration
 * @access Protected (Requires settings.update)
 */
settingsRouter.patch(
  "/features/:key",
  requirePermission("settings.update"),
  validate({ params: featureFlagParamSchema, body: updateFeatureFlagSchema }),
  settingsController.updateFeatureFlag
);

/**
 * @route PUT /settings/features/:key
 * @desc Updates a feature flag status or configuration
 * @access Protected (Requires settings.update)
 */
settingsRouter.put(
  "/features/:key",
  requirePermission("settings.update"),
  validate({ params: featureFlagParamSchema, body: updateFeatureFlagSchema }),
  settingsController.updateFeatureFlag
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
 * @access Protected (Requires settings.update)
 */
settingsRouter.patch(
  "/feature-flags/:key",
  requirePermission("settings.update"),
  validate({ params: featureFlagParamSchema, body: updateFeatureFlagSchema }),
  settingsController.updateFeatureFlag
);

/**
 * @route PATCH /settings/theme
 * @desc Updates platform theme settings
 * @access Protected (Requires settings.update or ADMIN)
 */
settingsRouter.patch(
  "/theme",
  requirePermission("settings.update"),
  settingsController.updateThemeSettings
);

/**
 * @route PUT /settings/cms/:key
 * @desc Upserts a CMS content section
 * @access Protected (Requires settings.update or ADMIN)
 */
settingsRouter.put(
  "/cms/:key",
  requirePermission("settings.update"),
  settingsController.updateCMSSection
);

/**
 * @route PATCH /settings/cms/:key
 * @desc Updates a CMS content section
 * @access Protected (Requires settings.update or ADMIN)
 */
settingsRouter.patch(
  "/cms/:key",
  requirePermission("settings.update"),
  settingsController.updateCMSSection
);

