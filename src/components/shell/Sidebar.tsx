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
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { Avatar } from "../ui/Badge.js";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { currentUser, logout, currentOrganization } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navGroups = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", path: "/", icon: LayoutDashboard },
        { label: "ST AI Assistant", path: "/ai", icon: Bot, badge: "AI" },
      ],
    },
    {
      title: "Business Operations",
      items: [
        { label: "Organizations", path: "/organizations", icon: Building2 },
        { label: "Workspaces", path: "/workspaces", icon: Briefcase },
        { label: "Clients", path: "/clients", icon: Users },
        { label: "Projects Pipeline", path: "/projects", icon: FolderKanban },
        { label: "Payments", path: "/payments", icon: CreditCard },
      ],
    },
    {
      title: "Team & Talent",
      items: [
        { label: "Applicants", path: "/applicants", icon: Users },
        { label: "Members", path: "/members", icon: Users },
      ],
    },
    {
      title: "Governance",
      items: [
        { label: "Roles & Access", path: "/roles", icon: ShieldCheck },
        { label: "Audit Logs", path: "/audit", icon: FileText },
        { label: "Notifications", path: "/notifications", icon: Bell },
        { label: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B88E20] text-black font-black flex items-center justify-center text-base shadow-lg shadow-amber-500/10 shrink-0 border border-amber-300/40">
            ST
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                ST-SOLUTIONS
              </span>
              <span className="text-[10px] text-amber-400 font-medium font-mono uppercase tracking-widest truncate">
                Shaf Tech Enterprise
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors hidden lg:block"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">
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
                        ? "bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37]"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                    } ${isCollapsed ? "justify-center px-0" : ""}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <Avatar name={currentUser?.fullName || currentUser?.email} size="sm" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.fullName || "User"}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser?.email}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
