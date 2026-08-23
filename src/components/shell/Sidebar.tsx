import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  FolderKanban,
  CreditCard,
  ShieldCheck,
  FileText,
  Settings,
  Bell,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { usePermission } from "../../hooks/usePermission.js";
import { Avatar } from "../ui/Badge.js";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { currentUser, logout, currentOrganization, currentWorkspace } = useAuth();
  const { canAccess } = usePermission();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navGroups: NavGroup[] = [
    {
      title: "Command Center",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
      ],
    },
    {
      title: "Business Operations",
      items: [
        { label: "Organizations", path: "/organizations", icon: Building2, module: "organizations" },
        { label: "Workspaces", path: "/workspaces", icon: Briefcase, module: "workspaces" },
        { label: "Clients", path: "/clients", icon: Users, module: "clients" },
        { label: "Projects", path: "/platform/projects", icon: FolderKanban, module: "projects" },
        { label: "Payments", path: "/payments", icon: CreditCard, module: "payments" },
      ],
    },
    {
      title: "People & Talent",
      items: [
        { label: "Members", path: "/members", icon: Users, module: "members" },
        { label: "Applicants", path: "/applicants", icon: UserCheck, module: "applicants" },
      ],
    },
    {
      title: "AI & Intelligence",
      items: [
        { label: "AI Assistant", path: "/ai", icon: Bot, badge: "AI", module: "ai" },
      ],
    },
    {
      title: "System & Governance",
      items: [
        { label: "Roles & Permissions", path: "/roles", icon: ShieldCheck, module: "roles" },
        { label: "Audit Logs", path: "/audit", icon: FileText, module: "audit" },
        { label: "Notifications", path: "/notifications", icon: Bell, module: "notifications" },
        { label: "Settings", path: "/settings", icon: Settings, module: "settings" },
      ],
    },
  ];


  // Filter groups according to current user access permissions
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(item.module)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-slate-950 text-slate-200 border-r border-slate-800/90 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B88E20] text-black font-black flex items-center justify-center text-sm shadow-lg shadow-amber-500/10 shrink-0 border border-amber-300/40 select-none">
            ST
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                ST-SOLUTIONS
              </span>
              <span className="text-[10px] text-[#D4AF37] font-medium font-mono uppercase tracking-widest truncate">
                Shaf Tech Solutions
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors hidden lg:flex items-center justify-center"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Tenant Context Chip (When Expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Organization
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {currentOrganization?.name || "Shaf Tech Solutions"}
              </div>
              {currentWorkspace && (
                <div className="text-[10px] text-slate-400 truncate">
                  ↳ {currentWorkspace.name}
                </div>
              )}
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
              {currentUser?.accountType || "ADMIN"}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredNavGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? "bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/90"
                    } ${isCollapsed ? "justify-center px-0" : ""}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <Avatar name={currentUser?.profile?.fullName || currentUser?.email} size="sm" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.profile?.fullName || currentUser?.email?.split("@")[0] || "User"}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser?.email}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

