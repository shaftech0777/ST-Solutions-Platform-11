import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { settingsService } from "../modules/settings/settings.service.js";
import { sanitizeFeatureFlagsMapResponse } from "../modules/settings/settings.mapper.js";

describe("Settings Module: Feature Toggles API & Mapper", () => {
  it("should sanitize and map feature flags list into a key-value boolean record", () => {
    const rawFlags = [
      { featureKey: "ai_copilot", status: "ENABLED", enabled: true },
      { featureKey: "applicant_onboarding_pipeline", status: "ENABLED" },
      { featureKey: "two_factor_enforcement", status: "DISABLED" },
    ];

    const map = sanitizeFeatureFlagsMapResponse(rawFlags);
    assert.deepEqual(map, {
      ai_copilot: true,
      applicant_onboarding_pipeline: true,
      two_factor_enforcement: false,
    });
  });

  it("should retrieve feature flags map via settingsService.getFeaturesMap", async () => {
    const features = await settingsService.getFeaturesMap();
    assert.equal(typeof features, "object");
    assert.equal(typeof features.ai_copilot, "boolean");
    assert.equal(typeof features.applicant_onboarding_pipeline, "boolean");
  });

  it("should allow updating feature flag toggle via settingsService.updateFeatureFlag", async () => {
    const updated = await settingsService.updateFeatureFlag("ai_copilot", { enabled: true });
    assert.equal(updated.featureKey, "ai_copilot");
    assert.equal(updated.status, "ENABLED");
  });
});
