import React from "react";
import { LucideIcon } from "lucide-react";

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
  title,
  description,
  headerAction }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-sm p-5 transition-all duration-200 ${
        hoverable || onClick
          ? "hover:border-[#D4AF37]/50 hover:shadow-md cursor-pointer"
          : ""
      } ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase font-mono">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading = false,
  onClick }) => {
  return (
    <Card onClick={onClick} hoverable={!!onClick} className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              {value}
            </p>
          )}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.isPositive ? "text-emerald-500" : "text-red-500"}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">vs last period</span>
        </div>
      )}
    </Card>
  );
};
