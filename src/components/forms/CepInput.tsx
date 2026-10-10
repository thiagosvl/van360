import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cepService } from "@/services/cepService";
import { cepMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { ControllerRenderProps, FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";

interface CepInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  onAddressFetched?: (address: {
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
  }) => void;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  nextField?: FieldPath<T>;
  onLoadingChange?: (loading: boolean) => void;
  isExternal?: boolean;
  namePrefix?: string;
  error?: boolean;
}

export function CepInput<T extends FieldValues>({
  field,
  label = "CEP",
  required = false,
  onAddressFetched,
  className,
  labelClassName,
  inputClassName,
  nextField = "numero" as FieldPath<T>,
  onLoadingChange,
  isExternal = false,
  namePrefix = "",
  error: errorProp,
}: CepInputProps<T>) {
  const [loadingCep, setLoadingCep] = useState(false);

  const updateLoading = (isLoading: boolean) => {
    setLoadingCep(isLoading);
    onLoadingChange?.(isLoading);
  };
  const form = useFormContext<T>();
  const formField = useFormField();
  const hasError = errorProp !== undefined ? errorProp : !!formField?.error;

  const handleCepChange = async (value: string) => {
    const maskedValue = cepMask(value);
    field.onChange(maskedValue);

    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length === 8) {
      updateLoading(true);
      try {
        const address = await cepService.buscarEndereco(cleanValue);
        if (address) {
          // @ts-ignore - Dynamic path update
          form.setValue(`${namePrefix}logradouro` as any, address.logradouro, { shouldValidate: true });
          // @ts-ignore
          form.setValue(`${namePrefix}bairro` as any, address.bairro, { shouldValidate: true });
          // @ts-ignore
          form.setValue(`${namePrefix}cidade` as any, address.cidade, { shouldValidate: true });
          // @ts-ignore
          form.setValue(`${namePrefix}estado` as any, address.estado, { shouldValidate: true });

          onAddressFetched?.(address);

          if (nextField) {
            setTimeout(() => form.setFocus(`${namePrefix}${nextField}` as any), 100);
          }
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP");
      } finally {
        updateLoading(false);
      }
    }
  };

  return (
    <FormItem className={cn("space-y-1.5", className)}>
      <FormLabel className={cn("text-[#0a0a0a] font-medium text-xs", labelClassName)}>
        {label} {required ? <span className="text-[#e7000b]">*</span> : <span className="text-[11px] font-normal text-[#737373] ml-1">(Opcional)</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
          <Input
            {...field}
            placeholder="00000-000"
            maxLength={9}
            type="text"
            inputMode="numeric"
            className={cn("pl-10 pr-8 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none", inputClassName)}
            onChange={(e) => handleCepChange(e.target.value)}
            aria-invalid={hasError}
          />
          {loadingCep && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
