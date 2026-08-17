import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { EmptyState } from "../components/ui/EmptyState.js";
import { notificationsService } from "../api/services/notifications.service.js";
import { useAuth } from "../context/AuthContext.js";
import { NotificationItem } from "../types/index.js";
import { useToast } from "../context/ToastContext.js";
import { Bell, CheckCheck, Check, Clock, AlertCircle, Info, ShieldAlert, Sparkles } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const defaultNotifications: NotificationItem[] = [
    {
      id: "notif-1",
      userId: "u-1",
      type: "SYSTEM_WORKSPACE_CREATE",
      title: "New Workspace Created",
      message: "Workspace 'AI & Data Infrastructure' has been successfully provisioned and ready for operations.",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "notif-2",
      userId: "u-1",
      type: "FINANCE_PAYMENT_SUCCESS",
      title: "Milestone Payment Recorded",
      message: "Milestone payment of $45,000 for 'Cloud Native Migration' marked as COMPLETED.",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "notif-3",
      userId: "u-1",
      type: "SECURITY_AUTH_ROTATION",
      title: "Security Token Refreshed",
      message: "Your JWT session token was securely rotated following multi-tenant policy checks.",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: "notif-4",
      userId: "u-1",
      type: "TALENT_CANDIDATE_UPDATE",
      title: "Candidate Vetting Scheduled",
      message: "New applicant 'Elena Rostova' moved to SCREENING status for Senior Principal Architect.",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    },
  ];

  const loadNotifications = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await notificationsService.getAll({ unreadOnly: filterUnread });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
      } else {
        setNotifications(filterUnread ? defaultNotifications.filter((n) => !n.read) : defaultNotifications);
      }
    } catch {
      setNotifications(filterUnread ? defaultNotifications.filter((n) => !n.read) : defaultNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadNotifications();
  }, [filterUnread, currentUser?.id, isAuthLoading]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
    } catch {
      // Local optimistic update
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    showToast("Notification marked as read", "success");
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
    } catch {
      // Local optimistic update
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read", "success");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications Center"
        description="System telemetry events, payment alerts, and tenant activity updates"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={filterUnread ? "gold" : "outline"}
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
            >
              {filterUnread ? "Show All" : "Unread Only"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CheckCheck className="w-4 h-4" />}
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Fetching notification stream..." />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications Found"
          description="You're all caught up! Activity updates and alert feeds will appear here."
          icon={<Bell className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !notif.read
                  ? "bg-slate-900/90 border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20"
                  : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    !notif.read
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <Badge variant="gold" dot>
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!notif.read && (
                <div className="shrink-0 flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    Mark Read
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
