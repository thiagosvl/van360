import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cepService } from "@/services/cepService";
import { cepMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { ControllerRenderProps, FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { StitchField } from "./StitchField";

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

  if (isExternal) {
    return (
      <FormItem className={className}>
        <FormControl>
          <StitchField icon={MapPin} label={label} required={required} error={hasError}>
            <div className="relative flex items-center">
              <Input
                {...field}
                placeholder="00000-000"
                maxLength={9}
                type="text"
                inputMode="numeric"
                className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full pr-6"
                onChange={(e) => handleCepChange(e.target.value)}
                aria-invalid={hasError}
              />
              {loadingCep && (
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1a3a5c]" />
                </div>
              )}
            </div>
          </StitchField>
        </FormControl>
        <FormMessage className="text-xs ml-1 mt-1 text-red-500" />
      </FormItem>
    );
  }

  return (
    <FormItem className={className}>
      <FormLabel className={labelClassName}>
        {label} {required ? <span className="text-red-600">*</span> : <span className="text-xs font-normal text-slate-400 ml-1">(Opcional)</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
          <Input
            {...field}
            placeholder="00000-000"
            maxLength={9}
            type="text"
            inputMode="numeric"
            className={cn("pl-12 pr-8", inputClassName)}
            onChange={(e) => handleCepChange(e.target.value)}
            aria-invalid={hasError}
          />
          {loadingCep && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-[#1a3a5c]" />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
