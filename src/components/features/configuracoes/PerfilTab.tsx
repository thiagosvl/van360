import { PhoneInput } from "@/components/forms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/ui/Banner";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { emailSchema, phoneSchema } from "@/schemas/common";
import { usuarioApi } from "@/services/api/usuario.api";
import { cpfCnpjMask as maskCpf, phoneMask as maskPhone, dateMask as maskDate } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Info, Loader2, Mail, User, Save } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const basicSchema = z.object({
  nome: z.string()
    .min(2, "Deve ter pelo menos 2 caracteres")
    .refine((val) => val.trim().split(/\s+/).length >= 2, "Digite seu nome e sobrenome"),
  apelido: z.string().optional(),
  cpfcnpj: z.string(),
  telefone: phoneSchema,
  email: emailSchema,
  data_nascimento: z.string()
    .min(10, "Data inválida")
    .refine((val) => {
      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regex.test(val)) return false;

      const [dia, mes, ano] = val.split("/").map(Number);
      const data = new Date(ano, mes - 1, dia);

      if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
      ) {
        return false;
      }

      const hoje = new Date();
      if (data > hoje) return false;

      const idade = hoje.getFullYear() - data.getFullYear();
      const mesDiff = hoje.getMonth() - data.getMonth();
      const diaDiff = hoje.getDate() - data.getDate();

      let idadeReal = idade;
      if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
        idadeReal--;
      }

      return idadeReal >= 18 && idadeReal <= 100;
    }, "Você deve ser maior de 18 anos"),
  razao_social: z.string().optional(),
}).superRefine((data, ctx) => {
  const isCnpj = data.cpfcnpj.replace(/\D/g, "").length > 11;
  if (isCnpj && (!data.razao_social || data.razao_social.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Razão social é obrigatória para CNPJ",
      path: ["razao_social"],
    });
  }
});

type FormData = z.infer<typeof basicSchema>;

export const PerfilTab = React.memo(function PerfilTab() {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const form = useForm<FormData>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      nome: "",
      apelido: "",
      cpfcnpj: "",
      razao_social: "",
      telefone: "",
      email: "",
      data_nascimento: "",
    },
  });

  React.useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  React.useEffect(() => {
    if (profile) {
      const formatBirth = () => {
        if (!profile.data_nascimento) return "";
        const clean = profile.data_nascimento.trim();
        if (clean.includes("-")) {
          const parts = clean.split("-");
          if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
          }
        }
        return clean;
      };

      form.reset({
        nome: profile.nome || "",
        razao_social: profile.razao_social || "",
        apelido: profile.apelido || "",
        cpfcnpj: maskCpf(profile.cpfcnpj) || "",
        telefone: profile.telefone ? maskPhone(profile.telefone) : "",
        email: profile.email || "",
        data_nascimento: formatBirth(),
      });
    }
  }, [profile, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;
      const nome = cleanString(data.nome, true);
      const isCnpj = data.cpfcnpj.replace(/\D/g, "").length > 11;
      const razao_social = isCnpj && data.razao_social ? cleanString(data.razao_social, true) : undefined;
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");
      const data_nascimento = data.data_nascimento;

      await usuarioApi.atualizarUsuario(profile.id, {
        nome,
        razao_social,
        apelido,
        telefone,
        data_nascimento,
      });

      await refreshProfile();
      toast.success("cadastro.sucesso.perfilAtualizado");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error("cadastro.erro.atualizar", { description: errorMessage });
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const cpfcnpjLimpo = profile?.cpfcnpj ? profile.cpfcnpj.replace(/\D/g, "") : "";
  const isCnpj = cpfcnpjLimpo.length > 11;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-6">
      {/* Titulo do Card */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1a3a5c]">
            Dados Cadastrais
          </h2>
          <p className="text-xs text-slate-500">
            Mantenha suas informações pessoais e de contato atualizadas no aplicativo.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-5">
          {/* 1. Campos Protegidos (Leitura): CPF ou CNPJ e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cpfcnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-500 font-semibold ml-1">
                    CPF ou CNPJ <span className="text-red-600/60">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="h-12 rounded-xl bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
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
                <FormItem>
                  <FormLabel className="text-slate-500 font-semibold ml-1">
                    E-mail <span className="text-red-600/60">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        readOnly
                        className="pl-12 h-12 rounded-xl bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Banner Informativo sobre alteracao de CPF e Email */}
          <Banner
            variant="warning"
            description={
              <>
                Por motivos de segurança, para alterar seu{" "}
                <span className="font-black">CPF/CNPJ</span> ou{" "}
                <span className="font-black">E-mail</span> cadastrados, é necessário entrar em contato com o suporte.
              </>
            }
          />

          {/* 2. Razao Social (Exibido apenas se for CNPJ, posicionado abaixo do CNPJ e antes do Nome) */}
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
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Digite a razão social"
                        {...field}
                        value={field.value || ""}
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                        aria-invalid={
                          !!fieldState.error ||
                          ((!field.value || field.value.trim() === "") &&
                            Object.keys(formState.errors).length > 0)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {(!field.value || field.value.trim() === "") &&
                    Object.keys(formState.errors).length > 0 &&
                    !fieldState.error && (
                      <p className="text-[0.8rem] font-medium text-red-500 mt-1.5 ml-1">
                        Razão social é obrigatória para CNPJ
                      </p>
                    )}
                </FormItem>
              )}
            />
          )}

          {/* 3. Nome Completo e Apelido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Nome completo <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Digite seu nome completo"
                        {...field}
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                      />
                    </div>
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
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Apelido / Nome de Exibição
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Ex: Tio Fulano"
                        {...field}
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 4. Telefone / WhatsApp e Data de Nascimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <PhoneInput
                  field={field}
                  label="Telefone / WhatsApp"
                  placeholder="(00) 00000-0000"
                  required
                  labelClassName="text-slate-700 font-semibold ml-1"
                  inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                />
              )}
            />
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
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => field.onChange(maskDate(e.target.value))}
                        placeholder="dd/mm/aaaa"
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                        aria-invalid={!!fieldState.error}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 px-6 bg-[#1a3a5c] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#1a3a5c]/90 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
});
