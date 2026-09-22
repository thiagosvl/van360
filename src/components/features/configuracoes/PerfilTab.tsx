import { PhoneInput } from "@/components/forms";
import { LogoUpload } from "@/components/forms/LogoUpload";
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
import { usePermissions } from "@/hooks/business/usePermissions";
import { useLayout } from "@/contexts/LayoutContext";
import { cpfCnpjSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { usuarioApi } from "@/services/api/usuario.api";
import { cpfCnpjMask, phoneMask, dateMask as maskDate } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { getErrorMessage } from "@/utils/errorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Loader2, Mail, Trash2, User } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const basicSchema = z.object({
  nome: z.string()
    .min(2, "Deve ter pelo menos 2 caracteres")
    .refine((val) => val.trim().split(/\s+/).length >= 2, "Digite seu nome e sobrenome"),
  apelido: z.string().optional(),
  cpfcnpj: cpfCnpjSchema,
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
  const { isSubConta } = usePermissions();
  const { openExcluirContaDialog } = useLayout();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const [initialSnapshot, setInitialSnapshot] = React.useState<{
    cpfcnpj: string;
    email: string;
  } | null>(null);

  const hasInitializedRef = React.useRef(false);

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
    if (profile && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

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

      const formattedCpfCnpj = cpfCnpjMask(profile.cpfcnpj) || "";
      const profileEmail = profile.email || "";
      const profileRazaoSocial = profile.razao_social || "";

      setInitialSnapshot({
        cpfcnpj: formattedCpfCnpj,
        email: profileEmail,
      });

      form.reset({
        nome: profile.nome || "",
        razao_social: profileRazaoSocial,
        apelido: profile.apelido || "",
        cpfcnpj: formattedCpfCnpj,
        telefone: profile.telefone ? phoneMask(profile.telefone) : "",
        email: profileEmail,
        data_nascimento: formatBirth(),
      });
    }
  }, [profile, form]);

  const currentCpfCnpj = form.watch("cpfcnpj") || "";
  const currentCpfCnpjDigits = currentCpfCnpj.replace(/\D/g, "");
  const initialCpfCnpjDigits = initialSnapshot ? initialSnapshot.cpfcnpj.replace(/\D/g, "") : "";
  const hasCpfCnpjChanged = Boolean(initialSnapshot && currentCpfCnpjDigits !== initialCpfCnpjDigits);
  const isCnpj = currentCpfCnpjDigits.length > 11;
  const tipoDocumento = isCnpj ? "CNPJ" : "CPF";

  const prevIsCnpjRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (prevIsCnpjRef.current === null) {
      prevIsCnpjRef.current = isCnpj;
      return;
    }
    if (prevIsCnpjRef.current !== isCnpj) {
      if (isCnpj) {
        const savedRazao = profile?.razao_social || "";
        form.setValue("razao_social", savedRazao, { shouldValidate: false });
      } else {
        form.setValue("razao_social", "", { shouldValidate: false });
      }
      prevIsCnpjRef.current = isCnpj;
    }
  }, [isCnpj, profile?.razao_social, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;
      const nome = cleanString(data.nome, true);
      const isCnpjSubmit = data.cpfcnpj.replace(/\D/g, "").length > 11;
      const razao_social = isCnpjSubmit ? (cleanString(data.razao_social || "", true) || null) : null;
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");
      const data_nascimento = data.data_nascimento;
      const cpfcnpj = data.cpfcnpj.replace(/\D/g, "");
      const email = data.email.toLowerCase().trim();

      await usuarioApi.atualizarUsuario(profile.id, {
        nome,
        razao_social,
        apelido,
        telefone,
        data_nascimento,
        cpfcnpj,
        email,
      });

      await refreshProfile();

      const formattedCpfCnpj = cpfCnpjMask(cpfcnpj) || "";
      setInitialSnapshot({
        cpfcnpj: formattedCpfCnpj,
        email,
      });
      prevIsCnpjRef.current = isCnpjSubmit;
      form.reset({
        ...data,
        cpfcnpj: formattedCpfCnpj,
        telefone: phoneMask(data.telefone),
        razao_social: razao_social || "",
      });

      toast.success("cadastro.sucesso.perfilAtualizado");
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Ocorreu um erro ao salvar as alterações.");
      const lower = errorMessage.toLowerCase();
      if (lower.includes("cpf") || lower.includes("cnpj")) {
        form.setError("cpfcnpj", { message: errorMessage });
      } else if (lower.includes("e-mail") || lower.includes("email")) {
        form.setError("email", { message: errorMessage });
      } else if (lower.includes("razão social") || lower.includes("razao social")) {
        form.setError("razao_social", { message: errorMessage });
      }
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

      {!isSubConta && profile?.id && (
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#1a3a5c]">
              Logotipo da Van / Empresa
            </h3>
            <p className="text-xs text-slate-500">
              Personalize os contratos e recibos gerados com a marca do seu transporte escolar.
            </p>
          </div>
          <LogoUpload
            userId={profile.id}
            currentLogoUrl={profile.logo_url}
            onLogoChange={async (newLogoUrl) => {
              await usuarioApi.atualizarUsuario(profile.id, { logo_url: newLogoUrl });
              await refreshProfile();
            }}
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-5">
          {/* 1. Campos: CPF ou CNPJ e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cpfcnpj"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    CPF ou CNPJ <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        inputMode="numeric"
                        maxLength={18}
                        onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                        placeholder="000.000.000-00"
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
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
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    E-mail <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="email"
                        maxLength={255}
                        placeholder="seu.email@exemplo.com"
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                        aria-invalid={!!fieldState.error}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasCpfCnpjChanged && (
              <div className="sm:col-span-2">
                <Banner
                  variant="warning"
                  description={
                    <strong className="font-semibold text-amber-950">
                      Ao alterar o documento, utilize o novo {tipoDocumento} para fazer login no futuro.
                    </strong>
                  }
                />
              </div>
            )}
          </div>

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
                    Nome do Transporte / Apelido
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Ex: Tio Thiago"
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
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </Form>

      {!isSubConta && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-100">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-950">Excluir conta</h4>
              <p className="text-xs text-rose-800/80 leading-relaxed max-w-md">
                Ao excluir sua conta, todos os seus dados cadastrais, rotas, alunos e registros serão permanentemente apagados.
              </p>
            </div>
            <button
              type="button"
              onClick={openExcluirContaDialog}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-100/60 hover:text-rose-800 transition-colors shrink-0 shadow-xs flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Excluir minha conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
