import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { phoneMask } from "@/utils/masks";
import { Phone } from "lucide-react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
interface PhoneInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  isExternal?: boolean;
}

export function PhoneInput<T extends FieldValues>({
  field,
  label = "Telefone",
  required = false,
  placeholder = "(00) 00000-0000",
  className,
  labelClassName,
  inputClassName,
  disabled,
}: PhoneInputProps<T>) {
  const { error } = useFormField();

  return (
    <FormItem className={cn("space-y-1.5", className)}>
      <FormLabel className={cn("text-[#0a0a0a] font-medium text-xs", labelClassName)}>
        {label} {required && <span className="text-[#e7000b]">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
          <Input
            {...field}
            type="tel"
            inputMode="numeric"
            placeholder={placeholder}
            maxLength={15}
            onChange={(e) => {
              field.onChange(phoneMask(e.target.value));
            }}
            className={cn("pl-10", inputClassName)}
            aria-invalid={!!error}
            disabled={disabled}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
