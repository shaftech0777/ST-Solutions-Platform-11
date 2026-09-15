import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export interface AlertProps {
  type?: "success" | "warning" | "danger" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  children,
  className = "" }) => {
  const typeConfig = {
    success: {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
      border: "border-emerald-500/30",
      text: "text-emerald-900 dark:text-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> },
    warning: {
      bg: "bg-amber-500/10 dark:bg-amber-950/40",
      border: "border-amber-500/30",
      text: "text-amber-900 dark:text-amber-200",
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> },
    danger: {
      bg: "bg-red-500/10 dark:bg-red-950/40",
      border: "border-red-500/30",
      text: "text-red-900 dark:text-red-200",
      icon: <XCircle className="w-4 h-4 text-red-500 shrink-0" /> },
    info: {
      bg: "bg-blue-500/10 dark:bg-blue-950/40",
      border: "border-blue-500/30",
      text: "text-blue-900 dark:text-blue-200",
      icon: <Info className="w-4 h-4 text-blue-500 shrink-0" /> } }[type];

  return (
    <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${typeConfig.bg} ${typeConfig.border} ${typeConfig.text} ${className}`}>
      <div className="mt-0.5">{typeConfig.icon}</div>
      <div className="text-xs leading-relaxed">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
