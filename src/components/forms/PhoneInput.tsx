import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { phoneMask } from "@/utils/masks";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

interface PhoneInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInput<T extends FieldValues>({
  field,
  label = "Telefone",
  required = false,
  placeholder = "(00) 00000-0000",
  className,
}: PhoneInputProps<T>) {
  return (
    <FormItem>
      <FormLabel>
        {label} {required && <span className="text-red-600">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder={placeholder}
          maxLength={15}
          onChange={(e) => {
            field.onChange(phoneMask(e.target.value));
          }}
          className={className}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

