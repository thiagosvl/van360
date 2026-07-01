import { PhoneInput } from "@/components/forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cpfCnpjMask, dateMask } from "@/utils/masks";
import { Calendar, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";

interface CadastroFormProps {
  form: UseFormReturn<RegisterFormData>;
}

export const CadastroForm = ({ form }: CadastroFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const cpfcnpjValue = form.watch("cpfcnpj") || "";
  const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="cpfcnpj"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-slate-700 font-semibold ml-1">CPF ou CNPJ <span className="text-red-600">*</span></FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                <Input
                  {...field}
                  inputMode="numeric"
                  onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                  placeholder="CPF ou CNPJ"
                  className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                  aria-invalid={!!fieldState.error}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isCnpj && (
        <FormField
          control={form.control}
          name="razao_social"
          render={({ field, fieldState, formState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold ml-1">
                Razão Social <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                  <Input
                    placeholder="Digite a razão social"
                    {...field}
                    value={field.value || ""}
                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                    aria-invalid={!!fieldState.error || (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
              {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                <p className="text-[0.8rem] font-medium text-red-500 mt-1.5 ml-1">Razão social é obrigatória para CNPJ</p>
              )}
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="nome"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Nome completo <span className="text-red-600">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                <Input
                  placeholder="Digite seu nome completo"
                  {...field}
                  className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                  aria-invalid={!!fieldState.error}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <PhoneInput
              field={field}
              label="WhatsApp"
              required
              placeholder="(11) 99999-9999"
              labelClassName="text-slate-700 font-semibold ml-1"
              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
            />
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-semibold ml-1">
                E-mail <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                  <Input
                    placeholder="seu@email.com"
                    {...field}
                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                    aria-invalid={!!fieldState.error}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="data_nascimento"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Data de nascimento <span className="text-red-600">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                <Input
                  {...field}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => field.onChange(dateMask(e.target.value))}
                  placeholder="dd/mm/aaaa"
                  className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
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
        name="senha"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-slate-700 font-semibold ml-1">
              Crie uma senha segura <span className="text-red-600">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...field}
                  aria-invalid={!!fieldState.error}
                  className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 opacity-60" />
                  ) : (
                    <Eye className="h-5 w-5 opacity-60" />
                  )}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="termos_aceitos"
        render={({ field, fieldState }) => (
          <FormItem>
            <div className="flex items-start gap-3 pt-1">
              <FormControl>
                <Checkbox
                  id="termos_aceitos"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={`rounded-md w-5 h-5 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] mt-0.5 flex-shrink-0 ${fieldState.error ? "border-red-500" : "border-slate-400"}`}
                />
              </FormControl>
              <Label
                htmlFor="termos_aceitos"
                className="text-xs sm:text-[15px] text-slate-600 cursor-pointer select-none leading-relaxed font-medium"
              >
                Declaro que li e concordo com os Termos de Uso e a Política de Privacidade.
              </Label>
            </div>
            <FormMessage className="pl-8" />
          </FormItem>
        )}
      />
    </div>
  );
};
