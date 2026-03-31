import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";

interface Option {
  label: string;
  value: string;
}

interface DataTableFilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const DataTableFilterSelect = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  icon,
  className,
}: DataTableFilterSelectProps) => {
  return (
    <div className={cn("space-y-1.5 md:space-y-2", className)}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400/80">{icon}</span>}
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none ml-0.5">
          {label}
        </Label>
      </div>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full h-11 md:h-14 rounded-lg md:rounded-2xl bg-gray-50 border-gray-100 font-medium md:font-semibold text-[#1a3a5c] shadow-sm hover:bg-gray-100/50 transition-colors">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent className="z-[9999] rounded-xl border-gray-100 shadow-xl overflow-hidden">
          {options.map((opt) => (
            <SelectItem 
                key={opt.value} 
                value={opt.value}
                className="py-3 font-medium text-[#1a3a5c] focus:bg-gray-50 focus:text-[#1a3a5c] cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
