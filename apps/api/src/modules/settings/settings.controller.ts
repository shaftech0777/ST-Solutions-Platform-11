import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import { settingsService as defaultSettingsService, SettingsService } from "./settings.service.js";
import {
  UpdateCompanyProfileInputSchema,
  UpdateFeatureFlagInputSchema,
  UpdateSEOSettingsInputSchema,
  UpdateWebsiteSettingsInputSchema,
  UpsertSystemConfigInputSchema,
} from "./settings.validation.js";

/**
 * Controller class managing HTTP request handlers for System Settings.
 */
export class SettingsController {
  private readonly settingsService: SettingsService;

  constructor(settingsService: SettingsService = defaultSettingsService) {
    this.settingsService = settingsService;
  }

  /**
   * GET /api/v1/settings/public
   * Retrieves public, non-sensitive site configuration.
   */
  public getPublicSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const publicSettings = await this.settingsService.getPublicSettings();
      ResponseBuilder.success(res, publicSettings, {
        message: "Public settings retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/website
   * Retrieves full WebsiteSettings record.
   */
  public getWebsiteSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingsService.getWebsiteSettings();
      ResponseBuilder.success(res, settings, {
        message: "Website settings retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/settings/website
   * Updates WebsiteSettings.
   */
  public updateWebsiteSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateWebsiteSettingsInputSchema;
      const updated = await this.settingsService.updateWebsiteSettings(body);
      ResponseBuilder.success(res, updated, {
        message: "Website settings updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/seo
   * Retrieves SEOSettings.
   */
  public getSEOSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const seo = await this.settingsService.getSEOSettings();
      ResponseBuilder.success(res, seo, {
        message: "SEO settings retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/settings/seo
   * Updates SEOSettings.
   */
  public updateSEOSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateSEOSettingsInputSchema;
      const updated = await this.settingsService.updateSEOSettings(body);
      ResponseBuilder.success(res, updated, {
        message: "SEO settings updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/company
   * Retrieves CompanyProfile.
   */
  public getCompanyProfile = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const company = await this.settingsService.getCompanyProfile();
      ResponseBuilder.success(res, company, {
        message: "Company profile retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/settings/company
   * Updates CompanyProfile.
   */
  public updateCompanyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateCompanyProfileInputSchema;
      const updated = await this.settingsService.updateCompanyProfile(body);
      ResponseBuilder.success(res, updated, {
        message: "Company profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/system-configs
   * Retrieves all SystemConfiguration key-value pairs.
   */
  public getSystemConfigs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const configs = await this.settingsService.getSystemConfigs();
      ResponseBuilder.success(res, configs, {
        message: "System configurations retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/system-configs/:key
   * Retrieves a single SystemConfiguration by key.
   */
  public getSystemConfigByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const config = await this.settingsService.getSystemConfigByKey(key);
      ResponseBuilder.success(res, config, {
        message: "System configuration retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/settings/system-configs/:key
   * Upserts a SystemConfiguration key-value pair.
   */
  public upsertSystemConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const body = req.body as UpsertSystemConfigInputSchema;
      const updated = await this.settingsService.upsertSystemConfig({
        configKey: key,
        configValue: body.configValue,
        description: body.description,
      });

      ResponseBuilder.success(res, updated, {
        message: "System configuration updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/feature-flags
   * Retrieves all feature flags.
   */
  public getFeatureFlags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flags = await this.settingsService.getFeatureFlags();
      ResponseBuilder.success(res, flags, {
        message: "Feature flags retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/settings/feature-flags/:key
   * Updates a feature flag.
   */
  public updateFeatureFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const body = req.body as UpdateFeatureFlagInputSchema;
      const updated = await this.settingsService.updateFeatureFlag(key, body);

      ResponseBuilder.success(res, updated, {
        message: "Feature flag updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const settingsController = new SettingsController();
