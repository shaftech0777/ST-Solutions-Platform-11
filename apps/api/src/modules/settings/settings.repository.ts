import { Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";

/**
 * Repository layer for System Settings and Configuration domain.
 */
export class SettingsRepository extends BaseRepository {
  /**
   * Retrieves the WebsiteSettings record (or creates default if none exists).
   */
  public async getWebsiteSettings(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      let settings = await client.websiteSettings.findFirst();

      if (!settings) {
        settings = await client.websiteSettings.create({
          data: {
            maintenanceMode: false,
            allowNewApplications: true,
            allowClientRequests: true,
            allowAIAssistant: true,
            allowMemberApplications: true,
            defaultLanguage: "en",
            timezone: "UTC",
          },
        });
      }

      return settings;
    });
  }

  /**
   * Updates or creates WebsiteSettings record.
   */
  public async upsertWebsiteSettings(data: Prisma.WebsiteSettingsUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const existing = await client.websiteSettings.findFirst();

      if (existing) {
        return client.websiteSettings.update({
          where: { id: existing.id },
          data,
        });
      }

      return client.websiteSettings.create({
        data: {
          maintenanceMode: (data.maintenanceMode as boolean) ?? false,
          allowNewApplications: (data.allowNewApplications as boolean) ?? true,
          allowClientRequests: (data.allowClientRequests as boolean) ?? true,
          allowAIAssistant: (data.allowAIAssistant as boolean) ?? true,
          allowMemberApplications: (data.allowMemberApplications as boolean) ?? true,
          defaultLanguage: (data.defaultLanguage as string) ?? "en",
          timezone: (data.timezone as string) ?? "UTC",
        },
      });
    });
  }

  /**
   * Retrieves SEOSettings record (or creates default if none exists).
   */
  public async getSEOSettings(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      let seo = await client.sEOSettings.findFirst();

      if (!seo) {
        seo = await client.sEOSettings.create({
          data: {
            siteTitle: "ST-Solutions — Modern Software Solutions Platform",
            siteDescription: "Leading enterprise technology, bespoke web solutions, and software agency services.",
            keywords: "software, technology, web development, enterprise, solutions",
          },
        });
      }

      return seo;
    });
  }

  /**
   * Updates SEOSettings record.
   */
  public async upsertSEOSettings(data: Prisma.SEOSettingsUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const existing = await client.sEOSettings.findFirst();

      if (existing) {
        return client.sEOSettings.update({
          where: { id: existing.id },
          data,
        });
      }

      return client.sEOSettings.create({
        data: {
          siteTitle: (data.siteTitle as string) || "ST-Solutions",
          siteDescription: (data.siteDescription as string) || "ST-Solutions Technology Platform",
          keywords: (data.keywords as string) || "software, tech",
          canonicalUrl: (data.canonicalUrl as string) || null,
          ogImage: (data.ogImage as string) || null,
        },
      });
    });
  }

  /**
   * Retrieves CompanyProfile record.
   */
  public async getCompanyProfile(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.companyProfile.findFirst();
    });
  }

  /**
   * Updates or creates CompanyProfile record.
   */
  public async upsertCompanyProfile(data: Prisma.CompanyProfileUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const existing = await client.companyProfile.findFirst();

      if (existing) {
        return client.companyProfile.update({
          where: { id: existing.id },
          data,
        });
      }

      return client.companyProfile.create({
        data: {
          companyName: (data.companyName as string) || "ST-Solutions",
          legalName: (data.legalName as string) || null,
          tagline: (data.tagline as string) || "Innovating Digital Future",
          description: (data.description as string) || "Leading software development and technology solutions provider.",
          mission: (data.mission as string) || null,
          vision: (data.vision as string) || null,
          foundedYear: (data.foundedYear as number) || 2024,
          email: (data.email as string) || "contact@st-solutions.dev",
          phoneNumber: (data.phoneNumber as string) || "+10000000000",
          whatsappNumber: (data.whatsappNumber as string) || "+10000000000",
          website: (data.website as string) || "https://st-solutions.dev",
          country: (data.country as string) || "United States",
          city: (data.city as string) || "San Francisco",
          address: (data.address as string) || "Market St, Suite 100",
        },
      });
    });
  }

  /**
   * Retrieves all SystemConfiguration records.
   */
  public async getSystemConfigs(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.systemConfiguration.findMany({
        orderBy: { configKey: "asc" },
      });
    });
  }

  /**
   * Retrieves a single SystemConfiguration record by configKey.
   */
  public async getSystemConfigByKey(configKey: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.systemConfiguration.findUnique({
        where: { configKey: configKey.trim() },
      });
    });
  }

  /**
   * Upserts a SystemConfiguration key-value record.
   */
  public async upsertSystemConfig(
    configKey: string,
    configValue: string,
    description?: string,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const key = configKey.trim();

      return client.systemConfiguration.upsert({
        where: { configKey: key },
        update: {
          configValue: configValue.trim(),
          ...(description !== undefined ? { description: description.trim() } : {}),
        },
        create: {
          configKey: key,
          configValue: configValue.trim(),
          description: description?.trim() || null,
        },
      });
    });
  }

  /**
   * Retrieves all FeatureFlag records.
   */
  public async getFeatureFlags(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.featureFlag.findMany({
        orderBy: { featureKey: "asc" },
      });
    });
  }

  /**
   * Retrieves a FeatureFlag record by key.
   */
  public async getFeatureFlagByKey(featureKey: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.featureFlag.findUnique({
        where: { featureKey: featureKey.trim() },
      });
    });
  }

  /**
   * Updates a FeatureFlag record.
   */
  public async updateFeatureFlag(
    featureKey: string,
    data: Prisma.FeatureFlagUpdateInput,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.featureFlag.update({
        where: { featureKey: featureKey.trim() },
        data,
      });
    });
  }
}

export const settingsRepository = new SettingsRepository();
