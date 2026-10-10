import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ESTADOS_BRASILEIROS } from "@/constants/defaults";
import { CepInput } from "./CepInput";
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
      try {
        const uf = form.getValues(`${namePrefix}estado`);
        const cidade = form.getValues(`${namePrefix}cidade`);
        const results = await cepService.buscarEnderecoPorTexto(logradouroValue, uf, cidade);
        setSugestoes(results);
        setShowDropdown(results.length > 0 && isFocusedRef.current);
      } catch {
        setSugestoes([]);
      } finally {
        setIsSearchingAddress(false);
      }
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
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4">
      <div className="col-span-2 sm:col-span-6">
        <Banner
          variant="info"
          title="Não sabe o seu CEP?"
          description={
            <>
              Basta digitar o nome da rua no campo <strong>Logradouro</strong> para buscar as sugestões automaticamente.
            </>
          }
        />
      </div>

      <FormField
        control={form.control}
        name={`${namePrefix}cep`}
        render={({ field, fieldState }) => (
          <CepInput
            field={field}
            required={required}
            label="CEP"
            className="col-span-2 sm:col-span-2"
            labelClassName="text-[#0a0a0a] font-medium text-xs"
            inputClassName=""
            onLoadingChange={setIsCepLoading}
            isExternal={isExternal}
            namePrefix={namePrefix}
            error={!!fieldState.error}
          />
        )}
      />

      <FormField
        control={form.control}
        name={`${namePrefix}logradouro`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-2 sm:col-span-4 relative space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Logradouro {required && <span className="text-[#e7000b]">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                <Input
                  {...field}
                  autoComplete="off"
                  placeholder="Ex: Rua Comendador"
                  className="pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </FormControl>

            {showDropdown && sugestoes.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-[#e5e5e5] rounded-[18px] shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-[#e5e5e5] animate-in fade-in slide-in-from-top-1 duration-150">
                {sugestoes.map((sugestao, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-[#fafafa] transition-colors flex items-start gap-3 text-xs text-[#0a0a0a] font-medium group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSugestao(sugestao);
                    }}
                  >
                    <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0 border border-[#e5e5e5] mt-0.5">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[#0a0a0a] block text-xs break-words leading-snug">
                        {sugestao.logradouro}
                      </span>
                      <span className="text-[#737373] font-normal block text-[11px] break-words leading-relaxed mt-0.5">
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

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${namePrefix}numero`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-1 sm:col-span-2 space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Número {required && <span className="text-[#e7000b]">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Nº"
                  className="px-3.5 sm:px-4 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
        name={`${namePrefix}complemento`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-1 sm:col-span-2 space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Complemento
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Ex: Apto 101"
                  className="px-3.5 sm:px-4 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
        name={`${namePrefix}bairro`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-2 sm:col-span-2 space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Bairro {required && <span className="text-[#e7000b]">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ex: Centro"
                  className="px-3.5 sm:px-4 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
        name={`${namePrefix}cidade`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-2 sm:col-span-4 space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Cidade {required && <span className="text-[#e7000b]">*</span>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ex: São Paulo"
                  className="px-3.5 sm:px-4 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
        name={`${namePrefix}estado`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-2 sm:col-span-2 space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Estado {required && <span className="text-[#e7000b]">*</span>}
            </FormLabel>
            <FormControl>
              <NativeSelect
                {...field}
                value={field.value || ""}
                disabled={isCepLoading}
                error={!!fieldState.error}
                icon={<MapPin className="h-4 w-4" />}
              >
                <option value="" disabled hidden>UF</option>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${namePrefix}referencia`}
        render={({ field, fieldState }) => (
          <FormItem className="col-span-2 sm:col-span-6 space-y-1.5">
            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
              Ponto de Referência
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Ex: Próximo ao mercado..."
                  className="px-3.5 sm:px-4 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
