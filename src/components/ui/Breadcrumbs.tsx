import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home, Search, LayoutDashboard, Building2, Briefcase, Users, FolderKanban, CreditCard, ShieldCheck, Bell, Settings, Bot, FileText } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
      <Link to="/" className="hover:text-[#D4AF37] transition-colors flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 dark:text-slate-600 shrink-0" />
          {item.href ? (
            <Link to={item.href} className="hover:text-[#D4AF37] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-slate-200 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export const CommandSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent("st_open_command_search"));
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: "Dashboard Overview", path: "/", icon: LayoutDashboard, category: "Navigation" },
    { label: "Organizations", path: "/organizations", icon: Building2, category: "Navigation" },
    { label: "Workspaces", path: "/workspaces", icon: Briefcase, category: "Navigation" },
    { label: "Clients Directory", path: "/clients", icon: Users, category: "Business" },
    { label: "Projects Pipeline", path: "/projects", icon: FolderKanban, category: "Business" },
    { label: "Payments & Invoicing", path: "/payments", icon: CreditCard, category: "Business" },
    { label: "Applicants Pipeline", path: "/applicants", icon: Users, category: "Team" },
    { label: "Members & Access", path: "/members", icon: Users, category: "Team" },
    { label: "Roles & Permissions", path: "/roles", icon: ShieldCheck, category: "System" },
    { label: "Audit Log History", path: "/audit", icon: FileText, category: "System" },
    { label: "Notifications Center", path: "/notifications", icon: Bell, category: "System" },
    { label: "ST-Solutions AI Assistant", path: "/ai", icon: Bot, category: "Intelligence" },
    { label: "Platform Settings", path: "/settings", icon: Settings, category: "System" },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules, pages, actions... (Cmd+K)"
            className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 dark:text-slate-400">
            ESC
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matching routes or commands</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.path}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:text-white">
                      {cmd.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-950">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
