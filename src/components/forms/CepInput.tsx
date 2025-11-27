import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  inputClassName?: string;
}

export function CepInput<T extends FieldValues>({
  field,
  label = "CEP",
  required = false,
  onAddressFetched,
  className,
  inputClassName,
}: CepInputProps<T>) {
  const [loadingCep, setLoadingCep] = useState(false);
  const form = useFormContext<T>();

  const handleCepChange = async (value: string) => {
    const masked = cepMask(value);
    field.onChange(masked);

    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const endereco = await cepService.buscarEndereco(cleanCep);
        if (endereco) {
          // Preencher campos de endereço se existirem no form
          try {
            if (form.getValues("logradouro" as FieldPath<T>) !== undefined) {
              form.setValue("logradouro" as FieldPath<T>, endereco.logradouro);
            }
            if (form.getValues("bairro" as FieldPath<T>) !== undefined) {
              form.setValue("bairro" as FieldPath<T>, endereco.bairro);
            }
            if (form.getValues("cidade" as FieldPath<T>) !== undefined) {
              form.setValue("cidade" as FieldPath<T>, endereco.cidade);
            }
            if (form.getValues("estado" as FieldPath<T>) !== undefined) {
              form.setValue("estado" as FieldPath<T>, endereco.estado);
            }
          } catch {
            // Campos podem não existir no form, ignorar
          }

          // Callback opcional para customização
          if (onAddressFetched) {
            onAddressFetched(endereco);
          }
        } else {
          toast.info("sistema.info.cepNaoEncontrado", {
            description: "sistema.info.cepNaoEncontradoDescricao",
          });
        }
      } catch (error: any) {
        toast.error("sistema.erro.consultarCep", {
          description: error.message || "Não foi possível concluir a operação.",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return (
    <FormItem className={className}>
      <FormLabel className="text-gray-700 font-medium ml-1">
        {label} {required && <span className="text-red-600">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            {...field}
            placeholder="00000-000"
            maxLength={9}
            type="text"
            className={cn("pl-12 pr-8", inputClassName)}
            onChange={(e) => handleCepChange(e.target.value)}
          />
          {loadingCep && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

