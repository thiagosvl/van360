import { FormEnderecoFields, PhoneInput, StitchField } from "@/components/forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
          <Contact className="w-5 h-5" />
        </div>
        Responsável Financeiro
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* 1. Nome do Responsável (No form externo ocupa 100%, no interno vem após o CPF) */}
        {!isExternal && (
          <FormField
            control={form.control}
            name={fieldNames.cpf}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold ml-1">
                  CPF <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                    <Input
                      {...field}
                      value={field.value || ""}
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      onChange={(e) => {
                        field.onChange(cpfMask(e.target.value));
                      }}
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
            <FormItem className={isExternal ? "md:col-span-2" : ""}>
              {isExternal ? (
                <FormControl>
                  <StitchField icon={User} label="Nome do Responsável" required error={!!fieldState.error}>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Digite o nome completo"
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                      aria-invalid={!!fieldState.error}
                      disabled={isSearching}
                    />
                  </StitchField>
                </FormControl>
              ) : (
                <>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Nome <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Digite o nome completo"
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                        aria-invalid={!!fieldState.error}
                        disabled={isSearching}
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
          name={fieldNames.telefone}
          render={({ field }) => (
            <PhoneInput
              field={field}
              label="Telefone (WhatsApp)"
              required
              labelClassName="text-slate-700 font-semibold ml-1"
              inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
              <FormItem>
                <FormControl>
                  <StitchField icon={Hash} label="CPF" required={isExternal} error={!!fieldState.error}>
                    <Input
                      {...field}
                      value={field.value || ""}
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      onChange={(e) => {
                        field.onChange(cpfMask(e.target.value));
                      }}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                      aria-invalid={!!fieldState.error}
                    />
                  </StitchField>
                </FormControl>
                <FormMessage className="text-xs ml-1 mt-1 text-red-500" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name={fieldNames.parentesco}
          render={({ field, fieldState }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  {isExternal ? (
                    <StitchField icon={User} label="Parentesco" required={isExternal} error={!!fieldState.error}>
                      <SelectTrigger
                        className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none flex justify-between items-center text-left w-full data-[placeholder]:font-normal data-[placeholder]:text-slate-400"
                      >
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                    </StitchField>
                  ) : (
                    <>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Parentesco <span className="text-red-600">*</span>
                      </FormLabel>
                      <SelectTrigger
                        className={cn(
                          "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                          fieldState.error && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                    </>
                  )}
                </FormControl>
                <SelectContent>
                  {parentescos.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name={fieldNames.email}
          render={({ field, fieldState }) => (
            <FormItem className={isExternal ? "" : "md:col-span-2"}>
              {isExternal ? (
                <FormControl>
                  <StitchField icon={Mail} label="E-mail" required={true} error={!!fieldState.error}>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="email"
                      placeholder="exemplo@email.com"
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                      aria-invalid={!!fieldState.error}
                      disabled={isSearching}
                    />
                  </StitchField>
                </FormControl>
              ) : (
                <>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    E-mail
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="email"
                        placeholder="exemplo@email.com"
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                        aria-invalid={!!fieldState.error}
                        disabled={isSearching}
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

      <div className="pt-2 space-y-5">
        <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          Endereço Principal
        </div>
        <FormEnderecoFields namePrefix={fieldNames.enderecoPrefix} required={isExternal} isExternal={isExternal} />
      </div>
    </div>
  );
}
