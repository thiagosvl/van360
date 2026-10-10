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
import { PerfilTabSkeleton } from "@/components/skeletons";
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
import { Calendar, Image as ImageIcon, Loader2, Mail, Trash2, User } from "lucide-react";
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
  cpf_responsavel: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    const clean = val.replace(/\D/g, "");
    return clean.length === 11;
  }, "CPF do responsável deve ter 11 dígitos"),
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
      cpf_responsavel: "",
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
      const profileCpfResp = profile.cpf_responsavel ? cpfCnpjMask(profile.cpf_responsavel) : "";

      setInitialSnapshot({
        cpfcnpj: formattedCpfCnpj,
        email: profileEmail,
      });

      form.reset({
        nome: profile.nome || "",
        razao_social: profileRazaoSocial,
        cpf_responsavel: profileCpfResp,
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
      const cpf_responsavel = isCnpjSubmit ? (data.cpf_responsavel ? data.cpf_responsavel.replace(/\D/g, "") : null) : null;
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");
      const data_nascimento = data.data_nascimento;
      const cpfcnpj = data.cpfcnpj.replace(/\D/g, "");
      const email = data.email.toLowerCase().trim();

      await usuarioApi.atualizarUsuario(profile.id, {
        nome,
        razao_social,
        cpf_responsavel,
        apelido,
        telefone,
        data_nascimento,
        cpfcnpj,
        email,
      });

      await refreshProfile();

      const formattedCpfCnpj = cpfCnpjMask(cpfcnpj) || "";
      const formattedCpfResp = cpf_responsavel ? cpfCnpjMask(cpf_responsavel) : "";
      setInitialSnapshot({
        cpfcnpj: formattedCpfCnpj,
        email,
      });
      prevIsCnpjRef.current = isCnpjSubmit;
      form.reset({
        ...data,
        cpfcnpj: formattedCpfCnpj,
        cpf_responsavel: formattedCpfResp,
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
    return <PerfilTabSkeleton />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {!isSubConta && profile?.id && (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
          <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a0a0a]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Logotipo
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Personalize os contratos e recibos gerados com a marca do seu transporte escolar.
              </p>
            </div>
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

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-6">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Dados Cadastrais
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Gerencie suas informações pessoais e de contato
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpfcnpj"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      CPF ou CNPJ <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          inputMode="numeric"
                          maxLength={18}
                          onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                          placeholder="000.000.000-00"
                          className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
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
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      E-mail <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="email"
                          maxLength={255}
                          placeholder="seu.email@exemplo.com"
                          className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
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
                    description={`Ao alterar o documento, utilize o novo ${tipoDocumento} para fazer login no futuro.`}
                  />
                </div>
              )}
            </div>

            {isCnpj && (
              <>
                <FormField
                  control={form.control}
                  name="razao_social"
                  render={({ field, fieldState, formState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                        Razão Social <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            placeholder="Digite a razão social"
                            {...field}
                            value={field.value || ""}
                            className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
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
                          <p className="text-[0.8rem] font-medium text-[#e7000b] mt-1.5 ml-1">
                            Razão social é obrigatória para CNPJ
                          </p>
                        )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf_responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                        CPF do Responsável / Titular <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                            maxLength={14}
                            className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-[0.75rem] text-[#737373] ml-1">
                        Utilizado para identificação do titular em pagamentos e cartões pessoais.
                      </p>
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      Nome completo <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Digite seu nome completo"
                          {...field}
                          className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
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
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      Nome do Transporte / Apelido
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: Tio Thiago"
                          {...field}
                          className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    labelClassName="text-xs font-medium text-[#0a0a0a]"
                    inputClassName="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
                  />
                )}
              />
              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      Data de nascimento <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          {...field}
                          inputMode="numeric"
                          maxLength={10}
                          onChange={(e) => field.onChange(maskDate(e.target.value))}
                          placeholder="dd/mm/aaaa"
                          className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] pl-10 transition-colors"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#e5e5e5]">
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-11 px-6 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-[18px] hover:bg-primary-hover transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
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
      </div>

      {!isSubConta && (
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
          <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a0a0a]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Excluir Conta
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Encerramento definitivo do seu cadastro e dados associados.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs text-[#737373] leading-relaxed max-w-lg">
              Ao excluir sua conta, todos os seus dados cadastrais, rotas, alunos e registros serão permanentemente apagados.
            </p>
            <button
              type="button"
              onClick={openExcluirContaDialog}
              className="h-11 px-5 rounded-[18px] text-xs sm:text-sm font-medium text-[#e7000b] bg-white border border-[#e7000b]/20 hover:bg-[#e7000b]/10 hover:border-[#e7000b]/30 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-xs w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 text-[#e7000b]" />
              Excluir conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
