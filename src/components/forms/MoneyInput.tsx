import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { moneyMask } from "@/utils/masks";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

interface MoneyInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MoneyInput<T extends FieldValues>({
  field,
  label = "Valor",
  required = false,
  placeholder = "R$ 0,00",
  className,
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

