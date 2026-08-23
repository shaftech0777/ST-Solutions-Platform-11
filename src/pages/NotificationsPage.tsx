import React, { useEffect, useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  Info,
  ShieldAlert,
  Sparkles,
  Search,
  SlidersHorizontal,
  Mail,
  Briefcase,
  CreditCard,
  UserCheck,
  Building2,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { notificationsService, NotificationPreferenceData } from "../api/services/notifications.service.js";
import { useAuth } from "../context/AuthContext.js";
import { NotificationItem } from "../types/index.js";
import { useToast } from "../context/ToastContext.js";

export const NotificationsPage: React.FC = () => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Preferences Modal
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferenceData>({
    emailNotifications: true,
    projectUpdates: true,
    paymentAlerts: true,
    applicantSubmissions: true,
    securityAlerts: true,
    systemAnnouncements: true,
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const loadNotifications = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [notifsRes, unreadRes] = await Promise.allSettled([
        notificationsService.getAll({
          unreadOnly: activeTab === "unread" ? true : undefined,
          limit: 100,
        }),
        notificationsService.getUnreadCount(),
      ]);

      if (notifsRes.status === "fulfilled") {
        const data = notifsRes.value.data;
        setNotifications(Array.isArray(data) ? data : Array.isArray(notifsRes.value) ? (notifsRes.value as any) : []);
      } else {
        throw notifsRes.reason;
      }

      if (unreadRes.status === "fulfilled" && unreadRes.value?.data) {
        setUnreadCount(unreadRes.value.data.count ?? 0);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadNotifications();
  }, [activeTab, currentUser?.id, isAuthLoading]);

  // Open preferences modal and fetch existing preferences
  const openPreferencesModal = async () => {
    setIsPrefsModalOpen(true);
    try {
      const res = await notificationsService.getPreferences();
      if (res.data) {
        setPreferences(res.data);
      }
    } catch {
      // Use defaults if backend has not set preferences yet
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      await notificationsService.updatePreferences(preferences);
      addToast({
        type: "success",
        title: "Preferences Saved",
        message: "Your alert and email delivery preferences have been updated.",
      });
      setIsPrefsModalOpen(false);
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Update Failed",
        message: err.message || "Failed to update notification preferences.",
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      addToast({
        type: "info",
        title: "Marked as Read",
        message: "Notification updated.",
      });
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Action Failed",
        message: err.message || "Could not mark notification as read.",
      });
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await notificationsService.markAsUnread(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
      addToast({
        type: "info",
        title: "Marked as Unread",
        message: "Notification set to unread.",
      });
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Action Failed",
        message: err.message || "Could not mark notification as unread.",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
      addToast({
        type: "success",
        title: "All Caught Up",
        message: "All alerts have been marked as read.",
      });
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Action Failed",
        message: err.message || "Failed to mark notifications as read.",
      });
    }
  };

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const isRead = item.read ?? item.isRead ?? false;
      if (activeTab === "unread" && isRead) return false;
      if (activeTab === "read" && !isRead) return false;

      if (typeFilter !== "ALL") {
        const type = (item.type || "").toUpperCase();
        if (!type.includes(typeFilter)) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const title = (item.title || "").toLowerCase();
        const msg = (item.message || "").toLowerCase();
        const type = (item.type || "").toLowerCase();
        if (!title.includes(q) && !msg.includes(q) && !type.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeTab, typeFilter, search]);

  const getNotificationIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("PAYMENT") || t.includes("BILLING") || t.includes("FINANCE")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
      );
    }
    if (t.includes("SECURITY") || t.includes("AUTH") || t.includes("LOCK")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
      );
    }
    if (t.includes("APPLICANT") || t.includes("TALENT") || t.includes("CANDIDATE")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
      );
    }
    if (t.includes("PROJECT") || t.includes("WORKSPACE") || t.includes("ORGANIZATION")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-surface-hover text-text-muted flex items-center justify-center shrink-0">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="space-y-6" id="notifications-page-root">
      <PageHeader
        title="Notifications & Operational Alerts"
        description="System activity logs, milestone billing updates, candidate submissions, and security advisories."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={openPreferencesModal}
            >
              Alert Settings
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={<CheckCheck className="w-4 h-4" />}
                onClick={handleMarkAllRead}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs and Search Bar */}
      <Card className="p-4 border-border/60 bg-surface">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2 border-b md:border-b-0 border-border/40 pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "all"
                  ? "bg-gold text-black shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              All Alerts ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-gold text-black shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === "unread" ? "bg-black/20 text-black" : "bg-gold/20 text-gold"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("read")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "read"
                  ? "bg-gold text-black shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              Read / Archived
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-hover/60 border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadNotifications} />}

      {/* Loading state */}
      {isLoading && (
        <Card className="p-6 border-border/60">
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredNotifications.length === 0 && (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-gold/60" />}
          title={search ? "No matching notifications" : activeTab === "unread" ? "You're all caught up" : "No notifications yet"}
          description={
            search
              ? "Try adjusting your search criteria."
              : activeTab === "unread"
              ? "There are no unread alerts requiring your attention."
              : "System events, payment verifications, and candidate alerts will appear here."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadNotifications}
            >
              Check Again
            </Button>
          }
        />
      )}

      {/* Notifications List */}
      {!isLoading && !error && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isRead = notif.read ?? notif.isRead ?? false;

            return (
              <Card
                key={notif.id}
                className={`p-4 border transition-all ${
                  isRead
                    ? "border-border/40 bg-surface/60 opacity-80"
                    : "border-gold/30 bg-surface shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isRead ? "text-text" : "text-gold"}`}>
                          {notif.title}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-gold shrink-0 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-text-muted">
                        <Clock className="w-3 h-3 text-gold/80" />
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                        <span className="font-mono text-[10px] bg-surface-hover px-1.5 py-0.5 rounded">
                          {notif.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isRead ? (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        title="Mark as Unread"
                        onClick={() => handleMarkAsUnread(notif.id)}
                      />
                    ) : (
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alert Preferences Modal */}
      <Modal
        isOpen={isPrefsModalOpen}
        onClose={() => setIsPrefsModalOpen(false)}
        title="Notification & Delivery Preferences"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Configure delivery channels and category triggers for operational updates.
          </p>

          <div className="space-y-3">
            {[
              {
                key: "emailNotifications",
                label: "Email Digest Notifications",
                desc: "Receive email notifications for critical tenant events",
              },
              {
                key: "paymentAlerts",
                label: "Financial & Payment Alerts",
                desc: "Alerts when wire transfers, invoices, or settlements change status",
              },
              {
                key: "projectUpdates",
                label: "Project Milestone Changes",
                desc: "Notifications on deliverable completions, status transitions",
              },
              {
                key: "applicantSubmissions",
                label: "Applicant & Recruitment Pipeline",
                desc: "Alerts when new candidate registrations or interview notes are added",
              },
              {
                key: "securityAlerts",
                label: "Security & Access Audits",
                desc: "High-priority alerts for permission modifications and login sessions",
              },
            ].map((item) => {
              const checked = !!(preferences as any)[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      [item.key]: !checked,
                    })
                  }
                  className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-surface-hover/40 cursor-pointer hover:border-gold/30 transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-text">{item.label}</div>
                    <div className="text-[11px] text-text-muted">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    className="w-4 h-4 text-gold rounded border-border focus:ring-gold pointer-events-none"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrefsModalOpen(false)}
              disabled={isSavingPrefs}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              isLoading={isSavingPrefs}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
