import { PhoneInput, StitchField } from "@/components/forms";
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
import { Contact, Hash, Loader2, Mail, User } from "lucide-react";
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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
          <Contact className="w-5 h-5" />
        </div>
        Responsável Financeiro
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <FormField
          control={form.control}
          name="nome_responsavel"
          render={({ field, fieldState }) => (
            <FormItem>
              {isExternal ? (
                <FormControl>
                  <StitchField icon={User} label="Nome do Responsável" required error={!!fieldState.error}>
                    <Input
                      {...field}
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
                    Nome do Responsável Financeiro <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
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
          name="telefone_responsavel"
          render={({ field }) => (
            <PhoneInput
              field={field}
              label="Telefone do Responsável Financeiro"
              required
              labelClassName="text-slate-700 font-semibold ml-1"
              inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
              disabled={isSearching}
              isExternal={isExternal}
            />
          )}
        />

        <FormField
          control={form.control}
          name="cpf_responsavel"
          render={({ field, fieldState }) => (
            <FormItem>
              {isExternal ? (
                <FormControl>
                  <StitchField icon={Hash} label="CPF" required={isExternal} error={!!fieldState.error}>
                    <Input
                      {...field}
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
              ) : (
                <>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    CPF {isExternal && <span className="text-red-600">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
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
                </>
              )}
              <FormMessage className={isExternal ? "text-xs ml-1 mt-1 text-red-500" : ""} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentesco_responsavel"
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
                        Parentesco {isExternal && <span className="text-red-600">*</span>}
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

      </div>
    </div>
  );
}
