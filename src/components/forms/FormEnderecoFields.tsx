import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ESTADOS_BRASILEIROS } from "@/constants/defaults";
import { CepInput } from "./CepInput";

interface FormEnderecoFieldsProps {
  required?: boolean;
}

export function FormEnderecoFields({ required = false }: FormEnderecoFieldsProps) {
  const form = useFormContext();
  const [isCepLoading, setIsCepLoading] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <CepInput
            field={field}
            required={required}
            label="CEP"
            className="md:col-span-2"
            labelClassName="text-slate-700 font-semibold ml-1"
            inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
            onLoadingChange={setIsCepLoading}
          />
        )}
      />

      <FormField
        control={form.control}
        name="logradouro"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Logradouro {required && <span className="text-red-600">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ex: Rua Comendador"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  aria-invalid={!!fieldState.error}
                  disabled={isCepLoading}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numero"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Número {required && <span className="text-red-600">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Nº"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  aria-invalid={!!fieldState.error}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bairro"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Bairro {required && <span className="text-red-600">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ex: Centro"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  aria-invalid={!!fieldState.error}
                  disabled={isCepLoading}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cidade"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Cidade {required && <span className="text-red-600">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ex: São Paulo"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  aria-invalid={!!fieldState.error}
                  disabled={isCepLoading}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Estado {required && <span className="text-red-600">*</span>}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                    fieldState.error && "border-red-500",
                  )}
                  aria-invalid={!!fieldState.error}
                  disabled={isCepLoading}
                >
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-62 overflow-y-auto rounded-2xl shadow-xl border-slate-200">
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="referencia"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-6">
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Ponto de Referência
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ex: Próximo ao mercado..."
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  aria-invalid={!!fieldState.error}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
