import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-amber-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-lg text-sm bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border transition-all duration-200 pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 focus:border-[#D4AF37]"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = "", id, ...props }) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-amber-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={props.rows || 3}
        className={`w-full rounded-lg text-sm bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border transition-all duration-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 focus:border-[#D4AF37]"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, description, className = "", ...props }) => {
  return (
    <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        className={`mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-4 h-4 transition-colors ${className}`}
        {...props}
      />
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-slate-900 dark:text-slate-200">{label}</span>}
          {description && <p className="text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
};

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
          checked ? "bg-[#D4AF37]" : "bg-slate-300 dark:bg-slate-800"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      {label && <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
};
