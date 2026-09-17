import React, { useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";

export const OrganizationSelector: React.FC = () => {
  const { organizations, currentOrganization, switchOrganization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentOrganization && organizations.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
        <Building2 className="w-4 h-4 text-[#D4AF37]" />
        <span>No Organization</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-[#D4AF37]/50 text-slate-800 dark:text-slate-200 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 max-w-[170px] sm:max-w-[200px]"
        aria-label="Select organization"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-sm shrink-0 border border-[#D4AF37]/30">
            {currentOrganization?.name?.[0] || "O"}
          </div>
          <span className="truncate">{currentOrganization?.name || "Select Org"}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              Organizations
            </div>
            {organizations.map((org) => {
              const isSelected = org.id === currentOrganization?.id;
              return (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-[#D4AF37]/10 text-[#D4AF37] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspace, switchWorkspace } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentWorkspace && workspaces.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 max-w-[150px]"
        aria-label="Select workspace"
      >
        <span className="truncate">{currentWorkspace?.name || "Select Workspace"}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              Workspaces
            </div>
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspace?.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-[#D4AF37]/10 text-[#D4AF37] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

