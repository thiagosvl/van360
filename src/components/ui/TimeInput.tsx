import * as React from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeMask } from "@/utils/masks";

export interface TimeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string | null;
  onChange?: (value: string) => void;
  error?: boolean;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      value = "",
      onChange,
      onBlur,
      className,
      error = false,
      disabled = false,
      readOnly = false,
      placeholder = "00:00",
      ...props
    },
    ref
  ) => {
    const internalInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

    const displayValue = value || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = timeMask(e.target.value, displayValue);
      onChange?.(nextVal);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const current = displayValue.trim();
      if (/^([01]\d|2[0-3]):?$/.test(current)) {
        const cleanHour = current.replace(":", "");
        const completed = `${cleanHour.padStart(2, "0")}:00`;
        onChange?.(completed);
      }
      onBlur?.(e);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onChange?.("");
      internalInputRef.current?.focus();
    };

    return (
      <div className="relative w-full">
        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
        <input
          ref={internalInputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(
            "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none outline-none transition-colors",
            "focus:bg-white focus:border-[#0a0a0a] focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#e7000b] focus:border-[#e7000b]",
            className
          )}
          {...props}
        />
        {displayValue && !disabled && !readOnly && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer flex items-center justify-center p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";
