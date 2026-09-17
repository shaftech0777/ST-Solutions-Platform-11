import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "success" | "warning" | "danger" | "info" | "neutral" | "default" | "outline" | "rose" | "secondary" | "error";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  size = "md",
  className = "",
  dot = false }) => {
  const normalizedVariant =
    variant === "default" || variant === "outline" || variant === "secondary"
      ? "neutral"
      : variant === "rose" || variant === "error"
      ? "danger"
      : variant;

  const variantClasses = {
    gold: "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    neutral: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30" };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs" };

  const dotColorClass = {
    gold: "bg-[#D4AF37]",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-slate-400" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide uppercase font-mono ${variantClasses[normalizedVariant]} ${sizeClasses[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass[normalizedVariant]}`} />}
      {children}
    </span>
  );
};

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
    xl: "w-14 h-14 text-lg" };

  const getInitials = (n?: string | null) => {
    if (!n) return "ST";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-bold overflow-hidden border border-[#D4AF37]/40 bg-gradient-to-br from-slate-900 to-slate-800 text-[#D4AF37] shrink-0 select-none shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name || "User avatar"} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
