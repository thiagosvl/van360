import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moneyMask } from "@/utils/masks";
import { DollarSign } from "lucide-react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

interface MoneyInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function MoneyInput<T extends FieldValues>({
  field,
  label = "Valor",
  required = false,
  placeholder = "R$ 0,00",
  className,
  inputClassName,
  disabled = false,
}: MoneyInputProps<T>) {
  const { error } = useFormField();

  return (
    <FormItem className={className}>
      <FormLabel>
        {label} {required && <span className="text-red-600">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            {...field}
            placeholder={placeholder}
            type="text"
            className={inputClassName}
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

