import { FeatureFlagStatus } from "@prisma/client";

export interface WebsiteSettingsResponse {
  id: string;
  maintenanceMode: boolean;
  allowNewApplications: boolean;
  allowClientRequests: boolean;
  allowAIAssistant: boolean;
  allowMemberApplications: boolean;
  defaultLanguage: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateWebsiteSettingsInput {
  maintenanceMode?: boolean;
  allowNewApplications?: boolean;
  allowClientRequests?: boolean;
  allowAIAssistant?: boolean;
  allowMemberApplications?: boolean;
  defaultLanguage?: string;
  timezone?: string;
}

export interface SEOSettingsResponse {
  id: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  canonicalUrl: string | null;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSEOSettingsInput {
  siteTitle?: string;
  siteDescription?: string;
  keywords?: string;
  canonicalUrl?: string | null;
  ogImage?: string | null;
}

export interface CompanyProfileResponse {
  id: string;
  companyName: string;
  legalName: string | null;
  tagline: string | null;
  description: string;
  mission: string | null;
  vision: string | null;
  foundedYear: number | null;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  website: string | null;
  country: string;
  city: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCompanyProfileInput {
  companyName?: string;
  legalName?: string | null;
  tagline?: string | null;
  description?: string;
  mission?: string | null;
  vision?: string | null;
  foundedYear?: number | null;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  website?: string | null;
  country?: string;
  city?: string;
  address?: string;
}

export interface SystemConfigResponse {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertSystemConfigInput {
  configKey: string;
  configValue: string;
  description?: string;
}

export interface FeatureFlagResponse {
  id: string;
  featureKey: string;
  displayName: string;
  description: string | null;
  status: FeatureFlagStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateFeatureFlagInput {
  displayName?: string;
  description?: string | null;
  status?: FeatureFlagStatus;
}

export interface PublicSettingsResponse {
  website: {
    maintenanceMode: boolean;
    allowClientRequests: boolean;
    allowMemberApplications: boolean;
    allowNewApplications: boolean;
    allowAIAssistant: boolean;
    defaultLanguage: string;
    timezone: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    keywords: string;
    canonicalUrl: string | null;
    ogImage: string | null;
  } | null;
  company: {
    companyName: string;
    tagline: string | null;
    description: string;
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    website: string | null;
    country: string;
    city: string;
    address: string;
  } | null;
  featureFlags: Array<{
    featureKey: string;
    displayName: string;
    status: FeatureFlagStatus;
  }>;
}
