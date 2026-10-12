import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  wrapperClassName?: string;
  variant?: "default" | "white";
  minDate?: Date;
  maxDate?: Date;
  id?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Selecionar",
      disabled = false,
      error = false,
      className,
      wrapperClassName,
      variant = "default",
      minDate,
      maxDate,
      id,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none z-10" />
              <Button
                ref={ref}
                id={id}
                type="button"
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full h-10 sm:h-11 text-sm font-normal text-left transition-all duration-200 cursor-pointer",
                  "border border-[#e5e5e5] rounded-[18px]",
                  "focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#f5f5f5]",
                  variant === "white"
                    ? "bg-white hover:bg-white focus:bg-white shadow-xs hover:border-[#737373]/60"
                    : "bg-[#f5f5f5] hover:bg-white focus:bg-white",
                  "pl-10 pr-9 sm:pr-10 justify-start shadow-none",
                  !value ? "text-[#737373]" : "text-[#0a0a0a]",
                  error && "border-[#e7000b] focus:border-[#e7000b] focus:ring-[#e7000b]",
                  className
                )}
                aria-invalid={error}
              >
                <span className="truncate">
                  {value ? format(value, "dd/MM/yyyy") : placeholder}
                </span>
              </Button>
              <ChevronDown className="w-4 h-4 text-[#737373] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-auto p-0 rounded-[24px] border border-[#e5e5e5] bg-white shadow-lg z-50"
          >
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={(date) => {
                onChange?.(date);
                setOpen(false);
              }}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
