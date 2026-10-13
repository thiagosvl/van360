import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  hidePickerIndicator?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onClick, hidePickerIndicator, ...props }, ref) => {
    const hasPl = typeof className === "string" && /\bpl-\S+/.test(className);
    const hasPr = typeof className === "string" && /\bpr-\S+/.test(className);
    const hasPx = typeof className === "string" && /\bpx-\S+/.test(className);

    const isPickerType = type === "date" || type === "time" || type === "datetime-local";
    const shouldHideIndicator = hidePickerIndicator ?? (isPickerType && (hasPl || hasPr));

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(e);
      if (isPickerType && !props.readOnly && !props.disabled) {
        try {
          e.currentTarget.showPicker?.();
        } catch {
        }
      }
    };

    return (
      <input
        type={type}
        onClick={handleClick}
        className={cn(
          "flex h-9 w-full rounded-lg border border-border bg-background py-1.5 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          !hasPx && !hasPl && !hasPr && "px-3",
          !hasPx && hasPl && !hasPr && "pr-3",
          !hasPx && !hasPl && hasPr && "pl-3",
          shouldHideIndicator && "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

