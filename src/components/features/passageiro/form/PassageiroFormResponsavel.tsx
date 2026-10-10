import { FormEnderecoFields, PhoneInput } from "@/components/forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { parentescos } from "@/utils/formatters";
import { cpfMask } from "@/utils/masks";
import { Contact, Hash, Loader2, Mail, MapPin, User } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface PassageiroFormResponsavelProps {
  isSearching?: boolean;
  isExternal?: boolean;
}

export function PassageiroFormResponsavel({
  isSearching,
  isExternal = false,
}: PassageiroFormResponsavelProps) {
  const form = useFormContext();

  const fieldNames = {
    nome: isExternal ? "nome_responsavel" : "responsavel_principal.nome",
    cpf: isExternal ? "cpf_responsavel" : "responsavel_principal.cpf",
    telefone: isExternal ? "telefone_responsavel" : "responsavel_principal.telefone",
    parentesco: isExternal ? "parentesco_responsavel" : "responsavel_principal.parentesco",
    email: isExternal ? "email_responsavel" : "responsavel_principal.email",
    enderecoPrefix: isExternal ? "" : "responsavel_principal.",
  };

  return (
    <div className="space-y-8">
      <div id="section-responsavel-financeiro" className="space-y-5">
        <div className="flex items-center gap-3 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-5">
          <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] flex-shrink-0">
            <Contact className="w-4 h-4" />
          </div>
          Responsável Financeiro
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. Nome do Responsável (No form externo ocupa 100%, no interno vem após o CPF) */}
          {!isExternal && (
            <FormField
              control={form.control}
              name={fieldNames.cpf}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    CPF do Responsável
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        onChange={(e) => {
                          field.onChange(cpfMask(e.target.value));
                        }}
                        className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                        aria-invalid={!!fieldState.error}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name={fieldNames.nome}
            render={({ field, fieldState }) => (
              <FormItem className={cn(isExternal ? "sm:col-span-2" : "", "space-y-1.5")}>
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Nome do Responsável <span className="text-[#e7000b]">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Digite o nome completo"
                      className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                      aria-invalid={!!fieldState.error}
                      disabled={isSearching}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={fieldNames.telefone}
            render={({ field }) => (
              <PhoneInput
                field={field}
                label="Telefone (WhatsApp)"
                required
                labelClassName="text-[#0a0a0a] font-medium text-xs"
                inputClassName="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                disabled={isSearching}
                isExternal={isExternal}
              />
            )}
          />

          {isExternal && (
            <FormField
              control={form.control}
              name={fieldNames.cpf}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    CPF <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        onChange={(e) => {
                          field.onChange(cpfMask(e.target.value));
                        }}
                        className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                        aria-invalid={!!fieldState.error}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name={fieldNames.parentesco}
            render={({ field, fieldState }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Parentesco do Responsável {isExternal && <span className="text-[#e7000b]">*</span>}
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    {...field}
                    icon={<User className="h-4 w-4" />}
                    value={field.value || ""}
                    error={!!fieldState.error}
                  >
                    <option value="" disabled hidden>Selecionar</option>
                    {parentescos.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
            name={fieldNames.email}
            render={({ field, fieldState }) => (
              <FormItem className={cn(isExternal ? "" : "sm:col-span-2", "space-y-1.5")}>
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  E-mail do Responsável {isExternal && <span className="text-[#e7000b]">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="email"
                      placeholder="exemplo@email.com"
                      className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                      aria-invalid={!!fieldState.error}
                      disabled={isSearching}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {!isExternal && <hr className="border-[#e5e5e5]" />}

      <div id="section-endereco-principal" className="space-y-5">
        <div className="flex items-center gap-3 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-5">
          <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          Endereço Principal
        </div>
        <FormEnderecoFields namePrefix={fieldNames.enderecoPrefix} required={isExternal} isExternal={isExternal} />
      </div>
    </div>
  );
}
