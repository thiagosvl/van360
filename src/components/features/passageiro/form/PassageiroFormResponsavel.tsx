import { PhoneInput } from "@/components/forms";
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
}

export function PassageiroFormResponsavel({ isSearching }: PassageiroFormResponsavelProps) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
          <Contact className="w-5 h-5" />
        </div>
        Responsável
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="nome_responsavel"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Nome do Responsável <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                  <Input
                    {...field}
                    placeholder="Nome completo do responsável"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
          name="cpf_responsavel"
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

        <FormField
          control={form.control}
          name="parentesco_responsavel"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Parentesco <span className="text-red-600">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                      fieldState.error && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentescos.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="telefone_responsavel"
          render={({ field }) => (
            <PhoneInput
              field={field}
              label="WhatsApp"
              required
              labelClassName="text-slate-700 font-semibold ml-1"
              inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
              disabled={isSearching}
            />
          )}
        />
        <FormField
          control={form.control}
          name="email_responsavel"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold ml-1">
                E-mail <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                  <Input
                    type="email"
                    placeholder="exemplo@email.com"
                    {...field}
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
  );
}
