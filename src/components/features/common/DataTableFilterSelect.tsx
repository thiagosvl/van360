import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
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
  triggerClassName?: string;
}

export const DataTableFilterSelect = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  icon,
  className,
  triggerClassName,
}: DataTableFilterSelectProps) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-[#0a0a0a] leading-none block ml-0.5">
        {label}
      </Label>
      <NativeSelect
        icon={icon}
        variant="white"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={triggerClassName}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
};
