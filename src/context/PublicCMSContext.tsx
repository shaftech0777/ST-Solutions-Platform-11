import React, { createContext, useContext, useEffect, useState } from "react";
import { settingsService } from "../api/services/settings.service.js";
import { companyConfig as staticConfig } from "../data/companyConfig.js";

const PublicCMSContext = createContext<any>(staticConfig);

export const usePublicCMS = () => useContext(PublicCMSContext);

export const PublicCMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<any>(staticConfig);

  useEffect(() => {
    async function loadCMS() {
      try {
        const [brandRes, contactRes, faqsRes, socialsRes] = await Promise.all([
          settingsService.getCMSSection<any>("brand"),
          settingsService.getCMSSection<any>("contact"),
          settingsService.getCMSSection<any>("faqs"),
          settingsService.getCMSSection<any>("socials")
        ]);

        setConfig((prev: any) => {
          const next = { ...prev };
          if (brandRes) {
            next.name = brandRes.name || next.name;
            next.legalName = brandRes.legalName || next.legalName;
            next.tagline = brandRes.tagline || next.tagline;
            next.shortDescription = brandRes.shortDescription || next.shortDescription;
            next.longDescription = brandRes.longDescription || next.longDescription;
          }
          if (contactRes) {
            next.contact = { ...next.contact, ...contactRes };
          }
          if (faqsRes) {
            next.faqs = faqsRes;
          }
          if (socialsRes) {
            next.socials = socialsRes;
          }
          return next;
        });
      } catch (e) {
        console.error("Failed to load public CMS data", e);
      }
    }
    loadCMS();
  }, []);

  return (
    <PublicCMSContext.Provider value={config}>
      {children}
    </PublicCMSContext.Provider>
  );
};
