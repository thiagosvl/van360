import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moneyMask } from "@/utils/masks";
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
  return (
    <FormItem className={className}>
      <FormLabel>
        {label} {required && <span className="text-red-600">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder={placeholder}
          type="text"
          className={inputClassName}
          disabled={disabled}
          onChange={(e) => {
            field.onChange(moneyMask(e.target.value));
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

