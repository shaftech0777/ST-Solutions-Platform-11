import { apiClient } from "../client.js";

export interface WebsiteSettingsData {
  title?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  contactEmail?: string;
  supportEmail?: string;
  contactPhone?: string;
  address?: string;
  maintenanceMode?: boolean;
  allowRegistrations?: boolean;
}

export interface CompanyProfileData {
  companyName?: string;
  foundedYear?: number;
  taxNumber?: string;
  headquarters?: string;
  websiteUrl?: string;
  aboutUs?: string;
}

export const settingsService = {
  async getSettings() {
    return apiClient<WebsiteSettingsData>("/settings");
  },

  async updateSettings(data: WebsiteSettingsData) {
    return apiClient<WebsiteSettingsData>("/settings", {
      method: "PUT",
      body: data,
    });
  },

  async getWebsiteSettings() {
    return apiClient<WebsiteSettingsData>("/settings/website");
  },

  async updateWebsiteSettings(data: Partial<WebsiteSettingsData>) {
    return apiClient<WebsiteSettingsData>("/settings/website", {
      method: "PATCH",
      body: data,
    });
  },

  async getCompanyProfile() {
    return apiClient<CompanyProfileData>("/settings/company");
  },

  async updateCompanyProfile(data: Partial<CompanyProfileData>) {
    return apiClient<CompanyProfileData>("/settings/company", {
      method: "PATCH",
      body: data,
    });
  },

  async getFeatureFlags() {
    return apiClient<Record<string, boolean>>("/settings/features");
  },

  async updateFeatureFlag(flagName: string, enabled: boolean) {
    return apiClient(`/settings/features/${flagName}`, {
      method: "PATCH",
      body: { enabled },
    });
  },

  async getCMSSection<T>(key: string): Promise<T | null> {
    try {
      const response = await apiClient<any>(`/settings/cms/${key}`);
      return response?.data?.content ? (typeof response.data.content === "string" ? JSON.parse(response.data.content) : response.data.content) : null;
    } catch (err) {
      return null;
    }
  },

  async updateCMSSection(key: string, data: any) {
    return apiClient(`/settings/cms/${key}`, {
      method: "PUT",
      body: { content: data },
    });
  },
};
