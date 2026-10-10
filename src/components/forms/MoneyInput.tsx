import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moneyMask } from "@/utils/masks";
import { DollarSign } from "lucide-react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface MoneyInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function MoneyInput<T extends FieldValues>({
  field,
  label = "Valor",
  required = false,
  placeholder = "R$ 0,00",
  className,
  labelClassName,
  inputClassName,
  disabled = false,
}: MoneyInputProps<T>) {
  const { error } = useFormField();

  return (
    <FormItem className={className}>
      <FormLabel className={cn("text-[#0a0a0a] font-medium text-xs", labelClassName)}>
        {label} {required && <span className="text-[#e7000b]">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none z-10" />
          <Input
            {...field}
            placeholder={placeholder}
            type="text"
            inputMode="numeric"
            className={cn(
              "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] transition-all",
              inputClassName
            )}
            disabled={disabled}
            onChange={(e) => {
              field.onChange(moneyMask(e.target.value));
            }}
            aria-invalid={!!error}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

