import React, { createContext, useContext, useEffect, useState } from "react";
import { settingsService } from "../api/services/settings.service.js";
import { useAuth } from "./AuthContext.js";

const FeatureContext = createContext<Record<string, boolean>>({});

export const useFeatures = () => useContext(FeatureContext);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadFeatures() {
      if (!isAuthenticated) return;
      try {
        const res = await settingsService.getFeatureFlags();
        if (res && res.data) {
          setFeatures(res.data);
        }
      } catch (err) {
        console.error("Failed to load feature flags:", err);
      }
    }
    loadFeatures();
  }, [isAuthenticated]);

  return (
    <FeatureContext.Provider value={features}>
      {children}
    </FeatureContext.Provider>
  );
};
