import React from "react";
import { cn } from "@/lib/utils";

interface StitchFieldProps {
  icon: React.ElementType;
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted";
}

export function StitchField({
  icon: Icon,
  label,
  required = false,
  error = false,
  children,
  className = "",
  variant = "default",
}: StitchFieldProps) {
  const isMuted = variant === "muted";

  return (
    <div
      className={cn(
        "flex items-center border rounded-2xl p-2 shadow-2xs transition-all",
        isMuted
          ? "bg-slate-50/80 hover:bg-slate-100/50 focus-within:bg-white"
          : "bg-white",
        error
          ? "border-red-500 ring-2 ring-red-500/20"
          : isMuted
          ? "border-slate-200/90 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]"
          : "border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl mr-3 shrink-0 transition-colors",
          isMuted
            ? "bg-white text-slate-500 border border-slate-200/70 shadow-2xs"
            : "bg-slate-50 text-slate-400"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <label className="text-[11px] font-semibold text-slate-600 mb-0.5 truncate select-none">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        {children}
      </div>
    </div>
  );
}
