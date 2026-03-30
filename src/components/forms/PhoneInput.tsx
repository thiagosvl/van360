import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
    <FormItem className={className}>
      <FormLabel className={labelClassName}>
        {label} {required && <span className="text-red-600">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
          <Input
            {...field}
            placeholder={placeholder}
            maxLength={15}
            onChange={(e) => {
              field.onChange(phoneMask(e.target.value));
            }}
            className={inputClassName}
            aria-invalid={!!error}
            disabled={disabled}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

