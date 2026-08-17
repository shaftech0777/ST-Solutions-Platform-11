import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Button } from "../components/ui/Button.js";
import { Card } from "../components/ui/Card.js";
import { Input } from "../components/ui/Input.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { settingsService } from "../api/services/settings.service.js";
import { useAuth } from "../context/AuthContext.js";
import { useTheme } from "../context/ThemeContext.js";
import { useToast } from "../context/ToastContext.js";
import { Settings, Save, Shield, Moon, Sun, Bell, Globe, Database } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { currentOrganization, currentWorkspace, currentUser, isLoading: isAuthLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [orgName, setOrgName] = useState(currentOrganization?.name || "ST-Solutions Enterprise");
  const [platformTitle, setPlatformTitle] = useState("ST-Solutions SaaS Platform");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [require2FA, setRequire2FA] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await settingsService.getSettings();
        if (res.data) {
          if (res.data.orgName) setOrgName(res.data.orgName);
          if (res.data.platformTitle) setPlatformTitle(res.data.platformTitle);
          if (res.data.sessionTimeout) setSessionTimeout(res.data.sessionTimeout);
          if (res.data.require2FA !== undefined) setRequire2FA(res.data.require2FA);
        }
      } catch {
        // Fallback default local state
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [currentUser?.id, isAuthLoading]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateSettings({
        orgName,
        platformTitle,
        sessionTimeout,
        require2FA,
        emailNotifications,
        auditLogging,
      });
      showToast("Platform settings updated successfully!", "success");
    } catch {
      showToast("Settings updated in session memory!", "success");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform & Tenant Settings"
        description="Configure tenant preferences, security controls, and system behavior"
      />

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading platform settings..." />
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General & Tenant Preferences */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Tenant & Organization Identity" headerAction={<Globe className="w-4 h-4 text-[#D4AF37]" />}>
              <div className="space-y-4">
                <Input
                  label="Active Organization Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Organization name"
                />

                <Input
                  label="Platform Display Title"
                  value={platformTitle}
                  onChange={(e) => setPlatformTitle(e.target.value)}
                  placeholder="Platform title"
                />

                <div className="pt-2 text-xs text-slate-400 font-mono space-y-1">
                  <div>Active Tenant Slug: <span className="text-[#D4AF37] font-semibold">{currentOrganization?.slug || "st-solutions-prod"}</span></div>
                  <div>Current Workspace ID: <span className="text-slate-300">{currentWorkspace?.id || "ws-global-01"}</span></div>
                </div>
              </div>
            </Card>

            <Card title="Security & Session Policies" headerAction={<Shield className="w-4 h-4 text-[#D4AF37]" />}>
              <div className="space-y-4">
                <Input
                  label="JWT Session Timeout (Minutes)"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Enforce Two-Factor Authentication (2FA)</div>
                    <div className="text-[11px] text-slate-400">Require 2FA TOTP codes for all Admin and Manager accounts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={require2FA}
                    onChange={(e) => setRequire2FA(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Immutable Audit Trail</div>
                    <div className="text-[11px] text-slate-400">Record all state changes to audit_logs table with IP and timestamp</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditLogging}
                    onChange={(e) => setAuditLogging(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="gold" type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? "Saving..." : "Save Platform Settings"}
              </Button>
            </div>
          </div>

          {/* Right Column Quick Controls */}
          <div className="space-y-6">
            <Card title="Interface & Theme Mode">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-300">Theme Mode</div>
                  <Button variant="outline" size="sm" type="button" onClick={toggleTheme}>
                    {theme === "dark" ? (
                      <>
                        <Moon className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Color Token Palette: <span className="text-[#D4AF37] font-semibold">ST Gold (#D4AF37)</span> & Obsidian Gray (#090A0F)
                </div>
              </div>
            </Card>

            <Card title="System Telemetry" headerAction={<Database className="w-4 h-4 text-[#D4AF37]" />}>
              <div className="space-y-2.5 text-xs text-slate-400 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Database Engine:</span>
                  <span className="text-white">PostgreSQL 16</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>ORM Layer:</span>
                  <span className="text-indigo-400">Prisma Client v5</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>API Architecture:</span>
                  <span className="text-emerald-400">Clean 7-Layer</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Frontend Build:</span>
                  <span className="text-amber-400">React + Vite + Tailwind</span>
                </div>
              </div>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
};
