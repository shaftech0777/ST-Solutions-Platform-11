import {
  CompanyProfileResponse,
  FeatureFlagResponse,
  PublicSettingsResponse,
  SEOSettingsResponse,
  SystemConfigResponse,
  WebsiteSettingsResponse,
} from "./settings.types.js";

/**
 * Maps raw Prisma WebsiteSettings record to DTO.
 */
export function sanitizeWebsiteSettingsResponse(settings: any): WebsiteSettingsResponse {
  return {
    id: settings.id,
    maintenanceMode: settings.maintenanceMode,
    allowNewApplications: settings.allowNewApplications,
    allowClientRequests: settings.allowClientRequests,
    allowAIAssistant: settings.allowAIAssistant,
    allowMemberApplications: settings.allowMemberApplications,
    defaultLanguage: settings.defaultLanguage,
    timezone: settings.timezone,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

/**
 * Maps raw Prisma SEOSettings record to DTO.
 */
export function sanitizeSEOSettingsResponse(seo: any): SEOSettingsResponse {
  return {
    id: seo.id,
    siteTitle: seo.siteTitle,
    siteDescription: seo.siteDescription,
    keywords: seo.keywords,
    canonicalUrl: seo.canonicalUrl || null,
    ogImage: seo.ogImage || null,
    createdAt: seo.createdAt,
    updatedAt: seo.updatedAt,
  };
}

/**
 * Maps raw Prisma CompanyProfile record to DTO.
 */
export function sanitizeCompanyProfileResponse(company: any): CompanyProfileResponse {
  return {
    id: company.id,
    companyName: company.companyName,
    legalName: company.legalName || null,
    tagline: company.tagline || null,
    description: company.description,
    mission: company.mission || null,
    vision: company.vision || null,
    foundedYear: company.foundedYear || null,
    email: company.email,
    phoneNumber: company.phoneNumber,
    whatsappNumber: company.whatsappNumber,
    website: company.website || null,
    country: company.country,
    city: company.city,
    address: company.address,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

/**
 * Maps raw Prisma SystemConfiguration record to DTO.
 */
export function sanitizeSystemConfigResponse(config: any): SystemConfigResponse {
  return {
    id: config.id,
    configKey: config.configKey,
    configValue: config.configValue,
    description: config.description || null,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

/**
 * Maps raw Prisma FeatureFlag record to DTO.
 */
export function sanitizeFeatureFlagResponse(flag: any): FeatureFlagResponse {
  return {
    id: flag.id,
    featureKey: flag.featureKey,
    displayName: flag.displayName,
    description: flag.description || null,
    status: flag.status,
    createdAt: flag.createdAt,
    updatedAt: flag.updatedAt,
  };
}

/**
 * Maps public safe settings composite DTO.
 */
export function sanitizePublicSettingsResponse(
  website: any,
  seo: any,
  company: any,
  featureFlags: any[]
): PublicSettingsResponse {
  return {
    website: {
      maintenanceMode: website?.maintenanceMode ?? false,
      allowClientRequests: website?.allowClientRequests ?? true,
      allowMemberApplications: website?.allowMemberApplications ?? true,
      allowNewApplications: website?.allowNewApplications ?? true,
      allowAIAssistant: website?.allowAIAssistant ?? true,
      defaultLanguage: website?.defaultLanguage ?? "en",
      timezone: website?.timezone ?? "UTC",
    },
    seo: seo
      ? {
          siteTitle: seo.siteTitle,
          siteDescription: seo.siteDescription,
          keywords: seo.keywords,
          canonicalUrl: seo.canonicalUrl || null,
          ogImage: seo.ogImage || null,
        }
      : null,
    company: company
      ? {
          companyName: company.companyName,
          tagline: company.tagline || null,
          description: company.description,
          email: company.email,
          phoneNumber: company.phoneNumber,
          whatsappNumber: company.whatsappNumber,
          website: company.website || null,
          country: company.country,
          city: company.city,
          address: company.address,
        }
      : null,
    featureFlags: featureFlags.map((flag) => ({
      featureKey: flag.featureKey,
      displayName: flag.displayName,
      status: flag.status,
    })),
  };
}
