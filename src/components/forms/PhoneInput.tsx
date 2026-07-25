import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { phoneMask } from "@/utils/masks";
import { Phone } from "lucide-react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { StitchField } from "./StitchField";

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
  isExternal = false,
}: PhoneInputProps<T>) {
  const { error } = useFormField();

  if (isExternal) {
    return (
      <FormItem className={className}>
        <FormControl>
          <StitchField icon={Phone} label={label} required={required} error={!!error}>
            <Input
              {...field}
              type="tel"
              inputMode="numeric"
              placeholder={placeholder}
              maxLength={15}
              onChange={(e) => {
                field.onChange(phoneMask(e.target.value));
              }}
              className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
              aria-invalid={!!error}
              disabled={disabled}
            />
          </StitchField>
        </FormControl>
        <FormMessage className="text-xs ml-1 mt-1 text-red-500" />
      </FormItem>
    );
  }

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
            type="tel"
            inputMode="numeric"
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
