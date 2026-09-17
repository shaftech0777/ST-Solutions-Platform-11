import React, { createContext, useContext, useEffect, useState } from "react";
import { settingsService } from "../api/services/settings.service.js";
import { companyConfig as staticConfig } from "../data/companyConfig.js";

const PublicCMSContext = createContext<any>(staticConfig);

export const usePublicCMS = () => useContext(PublicCMSContext);

export const PublicCMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<any>(staticConfig);

  const loadCMS = async () => {
    try {
      const [brandRes, contactRes, faqsRes, socialsRes] = await Promise.all([
        settingsService.getCMSSection<any>("brand").catch(() => null),
        settingsService.getCMSSection<any>("contact").catch(() => null),
        settingsService.getCMSSection<any>("faqs").catch(() => null),
        settingsService.getCMSSection<any>("socials").catch(() => null),
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
          if (contactRes.phoneNumber) {
            next.contact.phoneTel = `tel:${contactRes.phoneNumber.replace(/[^0-9+]/g, "")}`;
          }
        }
        if (faqsRes && Array.isArray(faqsRes)) {
          next.faqs = faqsRes;
        }
        if (socialsRes && Array.isArray(socialsRes)) {
          next.socials = socialsRes;
        }
        return next;
      });
    } catch (e) {
      console.error("Failed to load public CMS data", e);
    }
  };

  useEffect(() => {
    loadCMS();
    const handleCmsUpdate = () => {
      loadCMS();
    };
    window.addEventListener("st_cms_updated", handleCmsUpdate);
    return () => {
      window.removeEventListener("st_cms_updated", handleCmsUpdate);
    };
  }, []);

  return (
    <PublicCMSContext.Provider value={config}>
      {children}
    </PublicCMSContext.Provider>
  );
};
