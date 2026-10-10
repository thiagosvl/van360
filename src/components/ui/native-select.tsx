import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  wrapperClassName?: string;
  error?: boolean;
  variant?: "default" | "white";
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, wrapperClassName, icon, children, disabled, error, variant = "default", ...props }, ref) => {
    const hasCustomPr = typeof className === "string" && /\bpr-\S+/.test(className);

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] flex items-center justify-center shrink-0 z-10">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full appearance-none transition-all duration-200 cursor-pointer",
            "h-10 sm:h-11 text-sm font-normal text-[#0a0a0a]",
            variant === "white"
              ? "bg-white hover:bg-white focus:bg-white shadow-xs hover:border-[#737373]/60"
              : "bg-[#f5f5f5] hover:bg-white focus:bg-white",
            "border border-[#e5e5e5] rounded-[18px]",
            "focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#f5f5f5]",
            "aria-[invalid=true]:border-[#e7000b] aria-[invalid=true]:focus:ring-[#e7000b]",
            icon ? "pl-10" : "pl-3.5 sm:pl-4",
            "pr-9 sm:pr-10",
            error && "border-[#e7000b] focus:border-[#e7000b] focus:ring-[#e7000b]",
            className,
            icon && "pl-10",
            !hasCustomPr && "pr-9 sm:pr-10"
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="w-4 h-4 text-[#737373] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
      </div>
    );
  }
);

NativeSelect.displayName = "NativeSelect";
