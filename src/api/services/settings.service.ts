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

  async getCMSSection<T>(key: string): Promise<T> {
    const response = await apiClient<any>(`/settings/cms/${key}`);
    const sectionRecord = response?.data;
    if (!sectionRecord || sectionRecord.content === undefined || sectionRecord.content === null) {
      throw new Error(`CMS section '${key}' content is empty or missing`);
    }
    const rawContent = sectionRecord.content;
    const parsed = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    return parsed;
  },

  async updateCMSSection(key: string, data: any) {
    const res = await apiClient<any>(`/settings/cms/${key}`, {
      method: "PUT",
      body: { content: data },
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("st_cms_updated", { detail: { key, data } }));
    }
    return res;
  },
};
