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
import { cpfMask } from "@/utils/masks";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";
import { TermosUsoDialog as TermosDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";

interface CadastroFormProps {
  form: UseFormReturn<RegisterFormData>;
}

export const CadastroForm = ({ form }: CadastroFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [openTermos, setOpenTermos] = useState(false);
  const [openPolitica, setOpenPolitica] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium ml-1">
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

        <FormField
          control={form.control}
          name="cpfcnpj"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium ml-1">CPF <span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(cpfMask(e.target.value))}
                    placeholder="000.000.000-00"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium ml-1">
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

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <PhoneInput
              field={field}
              label="WhatsApp"
              required
              placeholder="(11) 99999-9999"
              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
            />
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="senha"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-slate-700 font-medium ml-1">
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
            <div className="flex items-start gap-2 pt-1 pb-2">
              <FormControl>
                <Checkbox
                  id="termos_aceitos"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={`rounded-md data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] mt-0.5 ${fieldState.error ? "border-red-500" : "border-slate-400"}`}
                />
              </FormControl>
              <Label
                htmlFor="termos_aceitos"
                className="text-xs sm:text-sm text-slate-500 cursor-pointer select-none leading-relaxed"
              >
                Li e aceito os{" "}
                <button
                  type="button"
                  onClick={() => setOpenTermos(true)}
                  className="font-bold text-[#1a3a5c] hover:text-[#f59e0b] hover:underline transition-colors focus:outline-none rounded-sm px-0.5"
                >
                  Termos de Uso
                </button>
                {" "}e a{" "}
                <button
                  type="button"
                  onClick={() => setOpenPolitica(true)}
                  className="font-bold text-[#1a3a5c] hover:text-[#f59e0b] hover:underline transition-colors focus:outline-none rounded-sm px-0.5"
                >
                  Política de Privacidade
                </button>
              </Label>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 opacity-80">
        <Lock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
        <span className="font-medium">
          Dados protegidos com criptografia de ponta a ponta.
        </span>
      </div>

      <TermosDialog open={openTermos} onOpenChange={setOpenTermos} />
      <PoliticaPrivacidadeDialog open={openPolitica} onOpenChange={setOpenPolitica} />
    </div>
  );
};
