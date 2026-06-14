import React, { useState, useEffect } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { DollarSign } from "lucide-react";

interface AdminMoneyInputProps extends Omit<InputProps, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  wrapperClassName?: string;
}

export function AdminMoneyInput({ value, onChange, className, wrapperClassName, ...props }: AdminMoneyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(moneyMask(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = moneyMask(e.target.value);
    const numberValue = moneyToNumber(masked);
    
    onChange(numberValue);
    setDisplayValue(masked);
  };

  return (
    <div className={`relative ${wrapperClassName || ""}`}>
      <DollarSign className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={`pl-9 ${className || ""}`}
        {...props}
      />
    </div>
  );
}
