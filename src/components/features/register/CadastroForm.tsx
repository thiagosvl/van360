import { PhoneInput } from "@/components/forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cpfMask } from "@/utils/masks";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { RegisterFormData } from "@/schemas/registerSchema";

interface CadastroFormProps {
  form: UseFormReturn<RegisterFormData>;
}

export const CadastroForm = ({ form }: CadastroFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Linha 1: Nome e Apelido */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className="text-gray-700 font-medium">
                Nome completo <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite seu nome completo"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apelido"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">
                Como quer ser chamado? <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Tio João"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpfcnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">CPF <span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(cpfMask(e.target.value))}
                  placeholder="000.000.000-00"
                  className="h-12 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">
                E-mail <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="seu@email.com"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
                />
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
              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all"
            />
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="senha"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-medium">
              Crie uma senha segura <span className="text-red-600">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...field}
                  aria-invalid={!!fieldState.error}
                  className="h-12 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </FormControl>
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
    </div>
  );
};
