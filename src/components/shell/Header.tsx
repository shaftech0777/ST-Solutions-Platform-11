import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
  LogOut,
  ShieldAlert,
  CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import { OrganizationSelector, WorkspaceSelector } from "./OrganizationSelector.js";
import { Avatar } from "../ui/Badge.js";
import { notificationsService } from "../../api/services/notifications.service.js";
import { NotificationItem } from "../../types/index.js";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenCommandSearch }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let eventSource: { close: () => void } | null = null;

    async function loadNotifications() {
      try {
        const [listRes, countRes] = await Promise.allSettled([
          notificationsService.getAll({ unreadOnly: false, limit: 10 }),
          notificationsService.getUnreadCount(),
        ]);

        if (isMounted) {
          if (listRes.status === "fulfilled" && listRes.value?.data) {
            const items = Array.isArray(listRes.value.data) ? listRes.value.data : [];
            setNotifications(items);
          }
          if (countRes.status === "fulfilled" && countRes.value?.data) {
            setUnreadCount(countRes.value.data.count ?? 0);
          }
        }
      } catch (err) {
        // Quiet fallback
      }
    }

    if (currentUser) {
      loadNotifications();

      // Connect to real-time Server-Sent Events (SSE) stream
      eventSource = notificationsService.createStream({
        onNotification: (newNotif) => {
          if (!isMounted) return;
          setNotifications((prev) => {
            const filtered = prev.filter((item) => item.id !== newNotif.id);
            return [newNotif, ...filtered].slice(0, 15);
          });
          setUnreadCount((prev) => prev + 1);
        },
        onUnreadCount: (count) => {
          if (!isMounted) return;
          setUnreadCount(count);
        } });
    }

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentUser]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    setIsNotifOpen(false);

    // Optimistically mark as read
    if (!notif.read && !notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await notificationsService.markAsRead(notif.id);
      } catch {
        // Quiet fail
      }
    }

    // Direct navigation if target URL exists
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    } else if (notif.type?.toUpperCase().includes("INQUIRY") || notif.type?.toUpperCase().includes("LEAD")) {
      navigate("/inquiries");
    } else {
      navigate("/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Quiet fail
    }
  };

  return (
    <header className="h-16 px-3 sm:px-6 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-20 flex items-center justify-between transition-colors duration-200">
      {/* Left side: Mobile menu toggle + Organization & Workspace Selectors */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <OrganizationSelector />
          <span className="text-slate-400 dark:text-slate-600 text-sm hidden sm:inline">/</span>
          <div className="hidden md:block">
            <WorkspaceSelector />
          </div>
        </div>
      </div>

      {/* Right side: Search button, Theme toggle, Notifications, Profile dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Command Search Button */}
        <button
          onClick={onOpenCommandSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          aria-label="Search modules and commands"
        >
          <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs font-mono rounded bg-white dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-800">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-sm text-[#D4AF37] hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.read && !n.isRead;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 text-sm transition-colors cursor-pointer select-none ${
                            isUnread ? "bg-[#D4AF37]/10 hover:bg-[#D4AF37]/15" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className={`font-semibold ${isUnread ? "text-[#D4AF37] dark:text-[#E5C158]" : "text-slate-900 dark:text-slate-200"}`}>
                              {n.title}
                            </p>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 bg-slate-50 dark:bg-slate-950">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-sm font-semibold text-[#D4AF37] hover:underline"
                  >
                    View all notifications →
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-white"
                  >
                    Preferences
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            aria-label="User account menu"
          >
            <Avatar name={currentUser?.profile?.fullName || currentUser?.email} size="sm" />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.profile?.fullName || currentUser?.email?.split("@")[0] || "User"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                    {currentUser?.accountType || "USER"}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Account Settings
                  </Link>
                  <Link
                    to="/audit"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Security Logs
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <button
                    id="header-signout-btn"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confirm Log Out</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to log out?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                id="cancel-logout-btn"
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-logout-btn"
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
