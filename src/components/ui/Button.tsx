import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "dark" | "outline" | "ghost" | "danger" | "primary" | "secondary";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "gold",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg";

  const sizeClasses = {
    xs: "px-2 py-1 text-[11px] gap-1",
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5" };

  const variantClasses = {
    gold: "bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#C59B27] hover:to-[#D4AF37] text-black font-semibold shadow-md hover:shadow-amber-500/20 focus:ring-[#D4AF37]",
    primary: "bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#C59B27] hover:to-[#D4AF37] text-black font-semibold shadow-md hover:shadow-amber-500/20 focus:ring-[#D4AF37]",
    dark: "bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 focus:ring-slate-500 shadow-sm",
    secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 focus:ring-slate-500 shadow-sm",
    outline: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500",
    ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",
    danger: "bg-red-600 hover:bg-red-700 text-white font-semibold focus:ring-red-500 shadow-sm" };

  const widthClass = fullWidth ? "w-full" : "";
  const renderedLeftIcon = leftIcon || icon;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        renderedLeftIcon && <span className="shrink-0">{renderedLeftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "dark" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  label?: string;
  tooltip?: string;
  icon?: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  icon,
  variant = "ghost",
  size = "md",
  isLoading = false,
  label,
  tooltip,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: "p-1 text-[10px] rounded",
    sm: "p-1.5 text-xs rounded-md",
    md: "p-2 text-sm rounded-lg",
    lg: "p-2.5 text-base rounded-xl" };

  const content = icon || children;
  const buttonLabel = label || tooltip || (typeof props.title === "string" ? props.title : "Action");

  return (
    <button
      aria-label={buttonLabel}
      title={tooltip || label || props.title}
      className={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${
        variant === "gold"
          ? "bg-[#D4AF37] text-black hover:bg-[#C59B27]"
          : variant === "dark"
          ? "bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-800"
          : variant === "outline"
          ? "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          : variant === "danger"
          ? "bg-red-600/10 text-red-500 hover:bg-red-600/20"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : content}
    </button>
  );
};
