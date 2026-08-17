import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ESTADOS_BRASILEIROS } from "@/constants/defaults";
import { CepInput } from "./CepInput";
import { StitchField } from "./StitchField";
import { Hash, Home, Info, Loader2, MapPin, Search } from "lucide-react";
import { cepService, EnderecoSugestao } from "@/services/cepService";

interface FormEnderecoFieldsProps {
  required?: boolean;
  isExternal?: boolean;
  namePrefix?: string;
}

export function FormEnderecoFields({ required = false, isExternal = false, namePrefix = "" }: FormEnderecoFieldsProps) {
  const form = useFormContext();
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [sugestoes, setSugestoes] = useState<EnderecoSugestao[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const userTypedRef = useRef(false);
  const isFocusedRef = useRef(false);

  const logradouroValue = form.watch(`${namePrefix}logradouro`);

  useEffect(() => {
    // Só faz a requisição HTTP se a alteração veio de uma digitação ativa do usuário (não por foco ou reset)
    if (!userTypedRef.current || !logradouroValue || logradouroValue.trim().length < 3) {
      setSugestoes([]);
      setShowDropdown(false);
      return;
    }

    // Debounce padrão de mercado (400ms): aguarda o usuário pausar a digitação antes de chamar a API
    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      const uf = form.getValues(`${namePrefix}estado`);
      const cidade = form.getValues(`${namePrefix}cidade`);
      const results = await cepService.buscarEnderecoPorTexto(logradouroValue, uf, cidade);
      setSugestoes(results);
      setShowDropdown(results.length > 0 && isFocusedRef.current);
      setIsSearchingAddress(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [logradouroValue, namePrefix, form]);

  const handleSelectSugestao = (sugestao: EnderecoSugestao) => {
    userTypedRef.current = false;
    form.setValue(`${namePrefix}logradouro`, sugestao.logradouro, { shouldValidate: true });
    if (sugestao.bairro) form.setValue(`${namePrefix}bairro`, sugestao.bairro, { shouldValidate: true });
    if (sugestao.cidade) form.setValue(`${namePrefix}cidade`, sugestao.cidade, { shouldValidate: true });
    if (sugestao.estado) form.setValue(`${namePrefix}estado`, sugestao.estado, { shouldValidate: true });
    if (sugestao.cep) form.setValue(`${namePrefix}cep`, sugestao.cep, { shouldValidate: true });

    setShowDropdown(false);
    setTimeout(() => {
      form.setFocus(`${namePrefix}numero`);
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6">
      {!isExternal && (
        <div className="md:col-span-6">
          <Banner
            variant="info"
            title="O CEP não é obrigatório!"
            description={
              <>
                Se você não souber o CEP, pode digitar o nome da rua direto no campo <strong>Logradouro</strong> para buscar as sugestões de endereço.
              </>
            }
          />
        </div>
      )}

      <FormField
        control={form.control}
        name={`${namePrefix}cep`}
        render={({ field }) => (
          <CepInput
            field={field}
            required={false}
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
        name={`${namePrefix}logradouro`}
        render={({ field, fieldState }) => (
          <FormItem className="md:col-span-4 relative">
            {isExternal ? (
              <FormControl>
                <StitchField icon={MapPin} label="Logradouro" required={required} error={!!fieldState.error}>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      placeholder="Ex: Rua Comendador"
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full pr-6"
                      aria-invalid={!!fieldState.error}
                      disabled={isCepLoading}
                      onChange={(e) => {
                        userTypedRef.current = true;
                        field.onChange(e);
                      }}
                      onFocus={() => {
                        isFocusedRef.current = true;
                        if (userTypedRef.current && sugestoes.length > 0) {
                          setShowDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        isFocusedRef.current = false;
                        setTimeout(() => setShowDropdown(false), 200);
                      }}
                    />
                    {isSearchingAddress && (
                      <Loader2 className="absolute right-0 top-1 h-4 w-4 animate-spin text-[#1a3a5c]" />
                    )}
                  </div>
                </StitchField>
              </FormControl>
            ) : (
              <>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  Logradouro {required && <span className="text-red-600">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                    <Input
                      {...field}
                      placeholder="Ex: Rua Comendador"
                      className="pl-12 pr-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                      aria-invalid={!!fieldState.error}
                      disabled={isCepLoading}
                      onChange={(e) => {
                        userTypedRef.current = true;
                        field.onChange(e);
                      }}
                      onFocus={() => {
                        isFocusedRef.current = true;
                        if (userTypedRef.current && sugestoes.length > 0) {
                          setShowDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        isFocusedRef.current = false;
                        setTimeout(() => setShowDropdown(false), 200);
                      }}
                    />
                    {isSearchingAddress && (
                      <div className="absolute right-3 top-3.5 flex items-center pointer-events-none">
                        <Loader2 className="h-5 w-5 animate-spin text-[#1a3a5c]" />
                      </div>
                    )}
                  </div>
                </FormControl>
              </>
            )}

            {showDropdown && sugestoes.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                {sugestoes.map((sugestao, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-xs text-slate-700 font-medium group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSugestao(sugestao);
                    }}
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors flex items-center justify-center shrink-0 border border-slate-200/60">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate flex-1">
                      <span className="font-bold text-[#1a3a5c] block text-xs truncate">
                        {sugestao.logradouro}
                      </span>
                      <span className="text-slate-500 font-normal block text-[11px] truncate mt-0.5">
                        {[sugestao.bairro, sugestao.cidade, sugestao.estado]
                          .filter(Boolean)
                          .join(", ")}
                        {sugestao.cep ? ` • CEP: ${sugestao.cep}` : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${namePrefix}numero`}
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
        name={`${namePrefix}complemento`}
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
        name={`${namePrefix}bairro`}
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
        name={`${namePrefix}cidade`}
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
        name={`${namePrefix}estado`}
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
        name={`${namePrefix}referencia`}
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
