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

interface RegisterFormData {
  nome: string;
  apelido: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha?: string;
  plano_id: string;
  sub_plano_id?: string;
  quantidade_personalizada?: number;
}

interface CadastroFormProps {
  form: UseFormReturn<RegisterFormData>;
}

export const CadastroForm = ({ form }: CadastroFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {/* Linha 1: Nome (sozinho no sm, 2 colunas no md+) e Apelido */}
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem className="sm:col-span-2 md:col-span-2">
          <FormLabel>
            Nome completo <span className="text-red-600">*</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="Digite seu nome completo" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="apelido"
      render={({ field }) => (
        <FormItem className="sm:col-span-1 md:col-span-1">
          <FormLabel>
            Como você quer ser chamado pelos pais?{" "}
            <span className="text-red-600">*</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="Ex: Tio João" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    {/* Linha 2: CPF, E-mail e Telefone (3 colunas no md+) */}
    <FormField
      control={form.control}
      name="cpfcnpj"
      render={({ field }) => (
        <FormItem className="sm:col-span-1 md:col-span-1">
          <FormLabel>
            CPF <span className="text-red-600">*</span>
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              onChange={(e) => field.onChange(cpfMask(e.target.value))}
              placeholder="000.000.000-00"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem className="sm:col-span-1 md:col-span-1">
          <FormLabel>
            E-mail <span className="text-red-600">*</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="Digite seu e-mail" {...field} />
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
          label="Telefone (WhatsApp)"
          required
          placeholder="(11) 99999-9999"
          className="sm:col-span-1 md:col-span-1"
        />
      )}
    />
    
    {/* Linha 3: Senha com ícone de olho */}
    <FormField
      control={form.control}
      name="senha"
      render={({ field }) => (
        <FormItem className="sm:col-span-2 md:col-span-3">
          <FormLabel>
            Senha <span className="text-red-600">*</span>
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                {...field}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
  );
};

