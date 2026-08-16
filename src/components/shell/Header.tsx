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
  CheckCircle,
} from "lucide-react";
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
  onOpenCommandSearch,
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await notificationsService.getAll({ unreadOnly: false, limit: 5 });
        if (isMounted && res.data) {
          const items = Array.isArray(res.data) ? res.data : [];
          setNotifications(items);
          setUnreadCount(items.filter((n) => !n.read).length);
        }
      } catch (err) {
        // Quiet fallback if notifications endpoint is pending
      }
    }
    if (currentUser) {
      loadNotifications();
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <OrganizationSelector />
          <span className="text-slate-300 dark:text-slate-700 text-xs sm:text-sm hidden sm:inline">/</span>
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
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          aria-label="Search modules and commands"
        >
          <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-white dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-800">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
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
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#D4AF37] hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs transition-colors ${
                          !n.read ? "bg-[#D4AF37]/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 bg-slate-50 dark:bg-slate-950">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-semibold text-[#D4AF37] hover:underline"
                  >
                    View all notifications →
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
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
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            aria-label="User account menu"
          >
            <Avatar name={currentUser?.fullName || currentUser?.email} size="sm" />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.fullName || "User"}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                    {currentUser?.accountType || "USER"}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Account Settings
                  </Link>
                  <Link
                    to="/audit"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    Security Logs
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={async () => {
                      setIsProfileOpen(false);
                      await logout();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
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
    </header>
  );
};
