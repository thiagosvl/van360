import React from "react";
import { cn } from "@/lib/utils";

interface StitchFieldProps {
  icon: React.ElementType;
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function StitchField({
  icon: Icon,
  label,
  required = false,
  error = false,
  children,
  className = "",
}: StitchFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all",
        error
          ? "border-red-500 ring-2 ring-red-500/20"
          : "border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]",
        className
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        {children}
      </div>
    </div>
  );
}
