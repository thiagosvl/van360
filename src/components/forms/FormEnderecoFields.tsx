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
import { StitchField } from "./StitchField";
import { Hash, Home, MapPin } from "lucide-react";

interface FormEnderecoFieldsProps {
  required?: boolean;
  isExternal?: boolean;
}

export function FormEnderecoFields({ required = false, isExternal = false }: FormEnderecoFieldsProps) {
  const form = useFormContext();
  const [isCepLoading, setIsCepLoading] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6">
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
            isExternal={isExternal}
          />
        )}
      />

      <FormField
        control={form.control}
        name="logradouro"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-4">
            {isExternal ? (
              <FormControl>
                <StitchField icon={MapPin} label="Logradouro" required={required} error={!!fieldState.error}>
                  <Input
                    {...field}
                    placeholder="Ex: Rua Comendador"
                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </StitchField>
              </FormControl>
            ) : (
              <>
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
              </>
            )}
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numero"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-2">
            {isExternal ? (
              <FormControl>
                <StitchField icon={Hash} label="Número" required={required} error={!!fieldState.error}>
                  <Input
                    {...field}
                    placeholder="Nº"
                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    aria-invalid={!!fieldState.error}
                  />
                </StitchField>
              </FormControl>
            ) : (
              <>
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
              </>
            )}
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="complemento"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-2">
            {isExternal ? (
              <FormControl>
                <StitchField icon={Home} label="Complemento" error={!!fieldState.error}>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Ex: Apto 101"
                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </StitchField>
              </FormControl>
            ) : (
              <>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Complemento
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Ex: Apto 101"
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                      aria-invalid={!!fieldState.error}
                      disabled={isCepLoading}
                    />
                  </div>
                </FormControl>
              </>
            )}
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bairro"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-2">
            {isExternal ? (
              <FormControl>
                <StitchField icon={MapPin} label="Bairro" required={required} error={!!fieldState.error}>
                  <Input
                    {...field}
                    placeholder="Ex: Centro"
                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </StitchField>
              </FormControl>
            ) : (
              <>
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
              </>
            )}
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cidade"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-4">
            {isExternal ? (
              <FormControl>
                <StitchField icon={MapPin} label="Cidade" required={required} error={!!fieldState.error}>
                  <Input
                    {...field}
                    placeholder="Ex: São Paulo"
                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    aria-invalid={!!fieldState.error}
                    disabled={isCepLoading}
                  />
                </StitchField>
              </FormControl>
            ) : (
              <>
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
              </>
            )}
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-2">
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <FormControl>
                {isExternal ? (
                  <StitchField icon={MapPin} label="Estado" required={required} error={!!fieldState.error}>
                    <SelectTrigger
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none flex justify-between items-center text-left w-full data-[placeholder]:font-normal data-[placeholder]:text-slate-400"
                      aria-invalid={!!fieldState.error}
                      disabled={isCepLoading}
                    >
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                  </StitchField>
                ) : (
                  <>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Estado {required && <span className="text-red-600">*</span>}
                    </FormLabel>
                    <SelectTrigger
                      className={cn(
                        "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                        fieldState.error && "border-red-500",
                      )}
                      aria-invalid={!!fieldState.error}
                      disabled={isCepLoading}
                    >
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                  </>
                )}
              </FormControl>
              <SelectContent className="max-h-62 overflow-y-auto rounded-2xl shadow-xl border-slate-200">
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="referencia"
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-6">
            {isExternal ? (
              <FormControl>
                <StitchField icon={MapPin} label="Ponto de Referência" error={!!fieldState.error}>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Ex: Próximo ao mercado..."
                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    aria-invalid={!!fieldState.error}
                  />
                </StitchField>
              </FormControl>
            ) : (
              <>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Ponto de Referência
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Ex: Próximo ao mercado..."
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                      aria-invalid={!!fieldState.error}
                    />
                  </div>
                </FormControl>
              </>
            )}
            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />
    </div>
  );
}
