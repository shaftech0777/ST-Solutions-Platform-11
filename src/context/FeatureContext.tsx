import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { settingsService } from "../api/services/settings.service.js";
import { useAuth } from "./AuthContext.js";

export interface FeatureContextValue {
  features: Record<string, boolean>;
  isFeatureEnabled: (key: string) => boolean;
  isLoading: boolean;
  refreshFeatures: () => Promise<void>;
  [key: string]: any;
}

const defaultFeatures: Record<string, boolean> = {
  ai_copilot: true,
  applicant_onboarding_pipeline: true,
  automated_invoice_generation: true,
  realtime_audit_streaming: true,
  two_factor_enforcement: false,
};

const defaultValue: FeatureContextValue = {
  ...defaultFeatures,
  features: defaultFeatures,
  isFeatureEnabled: (key: string) => Boolean(defaultFeatures[key]),
  isLoading: false,
  refreshFeatures: async () => {},
};

const FeatureContext = createContext<FeatureContextValue>(defaultValue);

export const useFeatures = () => useContext(FeatureContext);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [featureMap, setFeatureMap] = useState<Record<string, boolean>>(defaultFeatures);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadFeatures = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await settingsService.getFeatureFlags();
      const raw = res?.data;
      const parsed: Record<string, boolean> = { ...defaultFeatures };

      if (Array.isArray(raw)) {
        for (const item of raw) {
          if (item && item.featureKey) {
            parsed[item.featureKey] =
              item.status === "ENABLED" || item.status === true || item.enabled === true;
          }
        }
      } else if (raw && typeof raw === "object") {
        for (const [key, val] of Object.entries(raw)) {
          const anyVal = val as any;
          parsed[key] =
            anyVal === "ENABLED" || anyVal === true || anyVal?.status === "ENABLED";
        }
      }

      setFeatureMap(parsed);
    } catch (err) {
      console.warn("Failed to load feature flags from server, using defaults:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const value = useMemo<FeatureContextValue>(() => {
    return {
      ...featureMap,
      features: featureMap,
      isFeatureEnabled: (key: string) => Boolean(featureMap[key]),
      isLoading,
      refreshFeatures: loadFeatures,
    };
  }, [featureMap, isLoading, loadFeatures]);

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};
