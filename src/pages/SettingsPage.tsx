import React, { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Shield,
  Moon,
  Sun,
  Bell,
  Globe,
  Database,
  Lock,
  Building2,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Mail,
  Phone,
  Server,
  Layers,
  Workflow } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Badge } from "../components/ui/Badge.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { ErrorState } from "../components/ui/EmptyState.js";
import { settingsService, WebsiteSettingsData, CompanyProfileData } from "../api/services/settings.service.js";
import { authService } from "../api/services/auth.service.js";
import { useAuth } from "../context/AuthContext.js";
import { useTheme } from "../context/ThemeContext.js";
import { useToast } from "../context/ToastContext.js";
import { WebsiteCMS } from "../components/admin/WebsiteCMS.js";
import { ShowcaseManager } from "../components/admin/ShowcaseManager.js";
import { AutomationManager } from "../components/admin/AutomationManager.js";

export const SettingsPage: React.FC = () => {
  const { currentOrganization, currentWorkspace, currentUser, isLoading: isAuthLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "general" | "website_cms" | "showcase_manager" | "automation" | "security" | "company" | "features"
  >("general");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // General Platform Settings
  const [generalSettings, setGeneralSettings] = useState<WebsiteSettingsData>({
    title: "ST-Solutions Enterprise Platform",
    tagline: "Multi-Tenant Enterprise Operating System",
    description: "Enterprise SaaS platform orchestrating organizations, talent acquisition, and financials.",
    contactEmail: "support@st-solutions.com",
    contactPhone: "+1 (800) 555-0199",
    maintenanceMode: false,
    allowRegistrations: true });

  // Company Profile Settings
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData>({
    companyName: "ST-Solutions Inc.",
    taxNumber: "US-EIN-94-2849102",
    headquarters: "San Francisco, CA, United States",
    websiteUrl: "https://st-solutions.enterprise",
    aboutUs: "Enterprise software solutions powering mission-critical workflow infrastructure." });

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    ai_copilot: true,
    applicant_onboarding_pipeline: true,
    realtime_audit_streaming: true,
    automated_invoice_generation: true,
    two_factor_enforcement: false });

  // Security Form (Password change)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Saving states
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const loadSettings = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [genRes, compRes, featRes] = await Promise.allSettled([
        settingsService.getWebsiteSettings().catch(() => settingsService.getSettings()),
        settingsService.getCompanyProfile(),
        settingsService.getFeatureFlags(),
      ]);

      if (genRes.status === "fulfilled" && genRes.value?.data) {
        setGeneralSettings((prev) => ({ ...prev, ...genRes.value.data }));
      }

      if (compRes.status === "fulfilled" && compRes.value?.data) {
        setCompanyProfile((prev) => ({ ...prev, ...compRes.value.data }));
      }

      if (featRes.status === "fulfilled" && featRes.value?.data) {
        setFeatureFlags((prev) => ({ ...prev, ...featRes.value.data }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load platform configuration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadSettings();
  }, [currentUser?.id, isAuthLoading]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await settingsService.updateWebsiteSettings(generalSettings);
      addToast({
        type: "success",
        title: "Platform Settings Saved",
        message: "General platform configuration updated successfully." });
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Update Failed",
        message: err.message || "Failed to update platform settings." });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      await settingsService.updateCompanyProfile(companyProfile);
      addToast({
        type: "success",
        title: "Company Profile Saved",
        message: "Organization legal and business identity updated." });
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Update Failed",
        message: err.message || "Failed to update company profile." });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleToggleFeatureFlag = async (flagName: string) => {
    const nextState = !featureFlags[flagName];
    setFeatureFlags((prev) => ({ ...prev, [flagName]: nextState }));
    try {
      await settingsService.updateFeatureFlag(flagName, nextState);
      addToast({
        type: "info",
        title: "Feature Flag Toggled",
        message: `${flagName.replace(/_/g, " ").toUpperCase()} is now ${nextState ? "ENABLED" : "DISABLED"}.` });
    } catch (err: any) {
      // Revert state
      setFeatureFlags((prev) => ({ ...prev, [flagName]: !nextState }));
      addToast({
        type: "danger",
        title: "Toggle Failed",
        message: err.message || "Could not update feature flag." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current account password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword });

      addToast({
        type: "success",
        title: "Password Changed",
        message: "Your credentials have been securely rotated." });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.data?.message || err.data?.error || err.message || "Failed to change password. Please verify current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6" id="settings-page-root">
      <PageHeader
        title="Enterprise Platform Configuration"
        description="Tenant customization, security policies, company registry profile, and feature flags."
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadSettings}
            disabled={isLoading}
          >
            Reload Settings
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>General Platform</span>
        </button>

        <button
          onClick={() => setActiveTab("website_cms")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "website_cms"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Globe className="w-4 h-4 text-amber-500" />
          <span>Website Content CMS</span>
        </button>

        <button
          onClick={() => setActiveTab("showcase_manager")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "showcase_manager"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Showcase Projects</span>
        </button>

        <button
          onClick={() => setActiveTab("automation")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "automation"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Workflow className="w-4 h-4 text-indigo-500" />
          <span>Email & Automation</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Auth</span>
        </button>

        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "company"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company & Legal</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "features"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Feature Toggles</span>
        </button>
      </div>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadSettings} />}

      {/* Loading state */}
      {isLoading && (
        <Card className="p-6 border-border/60">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </Card>
      )}

      {/* GENERAL TAB */}
      {!isLoading && !error && activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Branding & Tenant Identity" className="p-6 border-border/60 bg-surface space-y-4">
                <Input
                  label="Platform Title *"
                  required
                  value={generalSettings.title || ""}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, title: e.target.value })}
                  placeholder="e.g. ST-Solutions Enterprise Platform"
                />

                <Input
                  label="Tagline / Brand Slogan"
                  value={generalSettings.tagline || ""}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                  placeholder="e.g. Multi-Tenant Enterprise OS"
                />

                <Textarea
                  label="System Purpose & Description"
                  rows={3}
                  value={generalSettings.description || ""}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                  placeholder="Describe your organization's mission and workspace purpose..."
                />
              </Card>

              <Card title="Contact & Support Information" className="p-6 border-border/60 bg-surface space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Support Email"
                    type="email"
                    value={generalSettings.contactEmail || ""}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    placeholder="support@example.com"
                  />

                  <Input
                    label="Support Hotline Phone"
                    value={generalSettings.contactPhone || ""}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                    placeholder="+1 (800) 555-0199"
                  />
                </div>
              </Card>
            </div>

            {/* Sidebar Context Card */}
            <div className="space-y-6">
              <Card title="Active Tenant Context" className="p-6 border-border/60 bg-surface space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-surface-hover/60 rounded-lg border border-border/60 space-y-1">
                    <span className="text-text-muted font-medium">Organization:</span>
                    <div className="font-bold text-text text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-gold" />
                      <span>{currentOrganization?.name || "Global Scope"}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-hover/60 rounded-lg border border-border/60 space-y-1">
                    <span className="text-text-muted font-medium">Active Workspace:</span>
                    <div className="font-bold text-text text-sm flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gold" />
                      <span>{currentWorkspace?.name || "All Workspaces"}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-hover/60 rounded-lg border border-border/60 space-y-1">
                    <span className="text-text-muted font-medium">Theme Mode:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-text capitalize font-semibold">{theme} Mode</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        leftIcon={theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        onClick={toggleTheme}
                      >
                        Toggle Theme
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <Button
                    type="submit"
                    variant="gold"
                    className="w-full"
                    disabled={isSavingGeneral}
                    isLoading={isSavingGeneral}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Platform Settings
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      )}

      {/* SECURITY & AUTH TAB */}
      {!isLoading && !error && activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Rotate Account Password" className="p-6 border-border/60 bg-surface space-y-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <Input
                label="Current Password *"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
              />

              <Input
                label="New Password *"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />

              <Input
                label="Confirm New Password *"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />

              <Button
                type="submit"
                variant="gold"
                disabled={isChangingPassword}
                isLoading={isChangingPassword}
                leftIcon={<Key className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </form>
          </Card>

          <Card title="Security & Authentication Policies" className="p-6 border-border/60 bg-surface space-y-4">
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg border border-border/60 bg-surface-hover/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text">Two-Factor Authentication (2FA)</div>
                  <div className="text-text-muted text-[11px]">Enforce time-based OTP for privileged admin actions</div>
                </div>
                <Badge variant={featureFlags.two_factor_enforcement ? "success" : "neutral"}>
                  {featureFlags.two_factor_enforcement ? "Enforced" : "Optional"}
                </Badge>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-surface-hover/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text">JWT Session Life Cycle</div>
                  <div className="text-text-muted text-[11px]">Auto-expiration and silent rotation every 15 minutes</div>
                </div>
                <Badge variant="gold">Active</Badge>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-surface-hover/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text">Multi-Tenant Isolation Guard</div>
                  <div className="text-text-muted text-[11px]">PostgreSQL Prisma layer strictly bounds query execution</div>
                </div>
                <Badge variant="success">Strict</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* COMPANY PROFILE TAB */}
      {!isLoading && !error && activeTab === "company" && (
        <form onSubmit={handleSaveCompany} className="space-y-6">
          <Card title="Company & Legal Entity Profile" className="p-6 border-border/60 bg-surface space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Legal Entity Name *"
                required
                value={companyProfile.companyName || ""}
                onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                placeholder="ST-Solutions Inc."
              />

              <Input
                label="Tax Identification / EIN / VAT"
                value={companyProfile.taxNumber || ""}
                onChange={(e) => setCompanyProfile({ ...companyProfile, taxNumber: e.target.value })}
                placeholder="US-EIN-94-2849102"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Headquarters Location"
                value={companyProfile.headquarters || ""}
                onChange={(e) => setCompanyProfile({ ...companyProfile, headquarters: e.target.value })}
                placeholder="San Francisco, CA, USA"
              />

              <Input
                label="Official Website URL"
                value={companyProfile.websiteUrl || ""}
                onChange={(e) => setCompanyProfile({ ...companyProfile, websiteUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <Textarea
              label="Corporate Overview"
              rows={3}
              value={companyProfile.aboutUs || ""}
              onChange={(e) => setCompanyProfile({ ...companyProfile, aboutUs: e.target.value })}
              placeholder="Enterprise software provider..."
            />

            <div className="flex justify-end pt-4 border-t border-border/60">
              <Button
                type="submit"
                variant="gold"
                disabled={isSavingCompany}
                isLoading={isSavingCompany}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Legal Profile
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* FEATURE TOGGLES TAB */}
      {!isLoading && !error && activeTab === "features" && (
        <Card title="Platform Feature Flags" className="p-6 border-border/60 bg-surface space-y-4 max-w-3xl">
          <p className="text-xs text-text-muted">
            Toggle enterprise modules dynamically across all tenant workspaces.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                key: "ai_copilot",
                label: "AI Copilot & Smart Assistant",
                desc: "Enable generative AI summaries and candidate screening aids" },
              {
                key: "applicant_onboarding_pipeline",
                label: "Applicant Onboarding Pipeline",
                desc: "Direct single-click conversion of approved applicants to team members" },
              {
                key: "realtime_audit_streaming",
                label: "Real-Time Audit Telemetry",
                desc: "Capture and index all user mutations in the security audit ledger" },
              {
                key: "automated_invoice_generation",
                label: "Automated Invoice Generation",
                desc: "Auto-generate PDF invoices upon payment milestone completions" },
              {
                key: "two_factor_enforcement",
                label: "Mandatory 2FA for Administrators",
                desc: "Enforce OTP authentication for all users holding ADMIN or OWNER roles" },
            ].map((flag) => {
              const isEnabled = !!featureFlags[flag.key];

              return (
                <div
                  key={flag.key}
                  onClick={() => handleToggleFeatureFlag(flag.key)}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-surface-hover/40 cursor-pointer hover:border-gold/40 transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-text">{flag.label}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">{flag.desc}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isEnabled ? "success" : "neutral"}>
                      {isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {isEnabled ? (
                      <ToggleRight className="w-6 h-6 text-gold" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-text-muted" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* WEBSITE CONTENT CMS TAB */}
      {!isLoading && !error && activeTab === "website_cms" && (
        <Card className="p-6 border-border/60">
          <WebsiteCMS />
        </Card>
      )}

      {/* SHOWCASE PROJECTS CMS TAB */}
      {!isLoading && !error && activeTab === "showcase_manager" && (
        <Card className="p-6 border-border/60">
          <ShowcaseManager />
        </Card>
      )}

      {/* EMAIL & AUTOMATION ENGINE TAB */}
      {!isLoading && !error && activeTab === "automation" && (
        <Card className="p-6 border-border/60">
          <AutomationManager />
        </Card>
      )}
    </div>
  );
};
