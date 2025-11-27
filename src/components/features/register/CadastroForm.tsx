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
import { Eye, EyeOff } from "lucide-react";
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
                Nome completo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite seu nome completo"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
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
                Como quer ser chamado?
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Tio João"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
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
              <FormLabel className="text-gray-700 font-medium">CPF</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(cpfMask(e.target.value))}
                  placeholder="000.000.000-00"
                  className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
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
                E-mail
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="seu@email.com"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
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
              // Removendo bg-gray-50 daqui se o componente já tiver, ou forçando se não tiver.
              // O usuário reclamou de "fundo" diferente. Vamos garantir que seja igual aos outros.
              className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
            />
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="senha"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-medium">
              Crie uma senha segura
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...field}
                  className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all pr-10"
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
           <span className="font-semibold text-blue-700">Segurança Garantida:</span>
        </div>
        <span className="leading-relaxed">
          Seus dados estão protegidos com criptografia de ponta a ponta.
        </span>
      </div>
    </div>
  );
};
