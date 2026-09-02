import { FeatureFlagStatus } from "@prisma/client";
import { BusinessError, NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import {
  sanitizeCompanyProfileResponse,
  sanitizeFeatureFlagResponse,
  sanitizeFeatureFlagsMapResponse,
  sanitizePublicSettingsResponse,
  sanitizeSEOSettingsResponse,
  sanitizeSystemConfigResponse,
  sanitizeWebsiteSettingsResponse,
} from "./settings.mapper.js";
import { settingsRepository as defaultSettingsRepository, SettingsRepository } from "./settings.repository.js";
import {
  CompanyProfileResponse,
  FeatureFlagResponse,
  PublicSettingsResponse,
  SEOSettingsResponse,
  SystemConfigResponse,
  UpdateCompanyProfileInput,
  UpdateFeatureFlagInput,
  UpdateSEOSettingsInput,
  UpdateWebsiteSettingsInput,
  UpsertSystemConfigInput,
  WebsiteSettingsResponse,
} from "./settings.types.js";

/**
 * Service managing System Settings and Platform Configuration business logic.
 */
export class SettingsService {
  private readonly settingsRepository: SettingsRepository;

  constructor(settingsRepository: SettingsRepository = defaultSettingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  /**
   * Prohibited pattern matchers for sensitive keys in generic SystemConfiguration.
   */
  private readonly sensitiveKeyPatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /api_key/i,
    /apikey/i,
    /private_key/i,
    /credential/i,
  ];

  /**
   * Retrieves composite public (non-sensitive) settings for site visitors.
   */
  public async getPublicSettings(): Promise<PublicSettingsResponse> {
    const [website, seo, company, featureFlags] = await Promise.all([
      this.settingsRepository.getWebsiteSettings(),
      this.settingsRepository.getSEOSettings(),
      this.settingsRepository.getCompanyProfile(),
      this.settingsRepository.getFeatureFlags(),
    ]);

    return sanitizePublicSettingsResponse(website, seo, company, featureFlags);
  }

  /**
   * Retrieves WebsiteSettings record.
   */
  public async getWebsiteSettings(): Promise<WebsiteSettingsResponse> {
    const settings = await this.settingsRepository.getWebsiteSettings();
    return sanitizeWebsiteSettingsResponse(settings);
  }

  /**
   * Updates WebsiteSettings record.
   */
  public async updateWebsiteSettings(input: UpdateWebsiteSettingsInput): Promise<WebsiteSettingsResponse> {
    const updated = await this.settingsRepository.upsertWebsiteSettings(input);
    return sanitizeWebsiteSettingsResponse(updated);
  }

  /**
   * Retrieves SEOSettings record.
   */
  public async getSEOSettings(): Promise<SEOSettingsResponse> {
    const seo = await this.settingsRepository.getSEOSettings();
    return sanitizeSEOSettingsResponse(seo);
  }

  /**
   * Updates SEOSettings record.
   */
  public async updateSEOSettings(input: UpdateSEOSettingsInput): Promise<SEOSettingsResponse> {
    const updated = await this.settingsRepository.upsertSEOSettings(input);
    return sanitizeSEOSettingsResponse(updated);
  }

  /**
   * Retrieves CompanyProfile record.
   */
  public async getCompanyProfile(): Promise<CompanyProfileResponse> {
    const company = await this.settingsRepository.getCompanyProfile();
    if (!company) {
      // Auto-initialize default company profile
      const initialized = await this.settingsRepository.upsertCompanyProfile({});
      return sanitizeCompanyProfileResponse(initialized);
    }
    return sanitizeCompanyProfileResponse(company);
  }

  /**
   * Updates CompanyProfile record.
   */
  public async updateCompanyProfile(input: UpdateCompanyProfileInput): Promise<CompanyProfileResponse> {
    const updated = await this.settingsRepository.upsertCompanyProfile(input);
    return sanitizeCompanyProfileResponse(updated);
  }

  /**
   * Retrieves all SystemConfiguration records.
   */
  public async getSystemConfigs(): Promise<SystemConfigResponse[]> {
    const configs = await this.settingsRepository.getSystemConfigs();
    return configs.map((c) => sanitizeSystemConfigResponse(c));
  }

  /**
   * Retrieves a single SystemConfiguration by key.
   */
  public async getSystemConfigByKey(key: string): Promise<SystemConfigResponse> {
    const config = await this.settingsRepository.getSystemConfigByKey(key);
    if (!config) {
      throw new NotFoundError(
        `System configuration key '${key}' not found`,
        ERROR_CODES.SETTINGS_NOT_FOUND
      );
    }
    return sanitizeSystemConfigResponse(config);
  }

  /**
   * Upserts a SystemConfiguration key-value record.
   * Enforces security policy blocking sensitive secret key storage.
   */
  public async upsertSystemConfig(input: UpsertSystemConfigInput): Promise<SystemConfigResponse> {
    const key = input.configKey.trim();

    for (const pattern of this.sensitiveKeyPatterns) {
      if (pattern.test(key)) {
        throw new BusinessError(
          `System configuration key '${key}' is disallowed as it appears to reference sensitive credentials or secrets.`,
          ERROR_CODES.SETTINGS_INVALID_KEY,
          { key }
        );
      }
    }

    const config = await this.settingsRepository.upsertSystemConfig(
      key,
      input.configValue,
      input.description
    );

    return sanitizeSystemConfigResponse(config);
  }

  /**
   * Retrieves FeatureFlags as a dictionary map (for frontend consumption) Record<string, boolean>.
   */
  public async getFeaturesMap(): Promise<Record<string, boolean>> {
    const flags = await this.settingsRepository.getFeatureFlags();
    return sanitizeFeatureFlagsMapResponse(flags);
  }

  /**
   * Retrieves all FeatureFlags.
   */
  public async getFeatureFlags(): Promise<FeatureFlagResponse[]> {
    const flags = await this.settingsRepository.getFeatureFlags();
    return flags.map((f) => sanitizeFeatureFlagResponse(f));
  }

  /**
   * Updates a FeatureFlag.
   */
  public async updateFeatureFlag(
    key: string,
    input: UpdateFeatureFlagInput
  ): Promise<FeatureFlagResponse> {
    const flag = await this.settingsRepository.getFeatureFlagByKey(key);
    if (!flag) {
      throw new NotFoundError(
        `Feature flag with key '${key}' not found`,
        ERROR_CODES.SETTINGS_NOT_FOUND
      );
    }

    let status = input.status;
    if (status === undefined && typeof input.enabled === "boolean") {
      status = input.enabled ? FeatureFlagStatus.ENABLED : FeatureFlagStatus.DISABLED;
    }

    const updatePayload: any = {};
    if (input.displayName !== undefined) updatePayload.displayName = input.displayName;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (status !== undefined) updatePayload.status = status;

    const updated = await this.settingsRepository.updateFeatureFlag(key, updatePayload);
    return sanitizeFeatureFlagResponse(updated);
  }

  /**
   * Retrieves theme settings.
   */
  public async getThemeSettings() {
    return this.settingsRepository.getThemeSettings();
  }

  /**
   * Updates theme settings (ADMIN ONLY).
   */
  public async updateThemeSettings(input: any, actor?: { userId: string; accountType?: string }) {
    if (actor && actor.accountType !== "ADMIN") {
      throw new BusinessError("Only ADMIN can update platform theme settings", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }
    return this.settingsRepository.upsertThemeSettings(input);
  }

  /**
   * Retrieves all CMS sections for website rendering.
   */
  public async getCMSSections() {
    return this.settingsRepository.getCMSSections();
  }

  /**
   * Retrieves single CMS section by key.
   */
  public async getCMSSectionByKey(sectionKey: string) {
    const section = await this.settingsRepository.getCMSSectionByKey(sectionKey);
    if (!section) {
      throw new NotFoundError(`CMS section '${sectionKey}' not found`, ERROR_CODES.SETTINGS_NOT_FOUND);
    }
    return section;
  }

  /**
   * Upserts a CMS section (ADMIN ONLY).
   */
  public async updateCMSSection(sectionKey: string, input: any, actor?: { userId: string; accountType?: string }) {
    if (actor && actor.accountType !== "ADMIN") {
      throw new BusinessError("Only ADMIN can modify website CMS content", ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS);
    }
    return this.settingsRepository.upsertCMSSection(sectionKey, input);
  }
}

export const settingsService = new SettingsService();
