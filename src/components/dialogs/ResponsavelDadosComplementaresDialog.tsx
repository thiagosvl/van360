import React from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cpfMask } from "@/utils/masks";
import { isValidCEPFormat, isValidCPF } from "@/utils/validators";
import { Mail, UserCheck, IdCard, MapPin } from "lucide-react";
import { responsavelApi } from "@/services/api/responsavel.api";
import { toast } from "sonner";
import { FormEnderecoFields } from "@/components/forms/FormEnderecoFields";

const complementaresSchema = z.object({
  cpf: z.string().optional().nullable().or(z.literal("")),
  email: z.string().optional().nullable().or(z.literal("")),
  cep: z.string().optional().nullable().or(z.literal("")),
  logradouro: z.string().optional().nullable().or(z.literal("")),
  numero: z.string().optional().nullable().or(z.literal("")),
  complemento: z.string().optional().nullable().or(z.literal("")),
  bairro: z.string().optional().nullable().or(z.literal("")),
  cidade: z.string().optional().nullable().or(z.literal("")),
  estado: z.string().optional().nullable().or(z.literal("")),
  referencia: z.string().optional().nullable().or(z.literal(""))
});

type ComplementaresFormValues = z.infer<typeof complementaresSchema>;

interface ResponsavelDadosComplementaresDialogProps {
  open: boolean;
  passageiroId: string;
  passageiroNome: string;
  initialCpf?: string;
  initialEmail?: string;
  initialCep?: string;
  initialLogradouro?: string;
  initialNumero?: string;
  initialComplemento?: string;
  initialBairro?: string;
  initialCidade?: string;
  initialEstado?: string;
  initialReferencia?: string;
  token: string;
  onSuccess: () => void | Promise<void>;
}

export const ResponsavelDadosComplementaresDialog: React.FC<ResponsavelDadosComplementaresDialogProps> = ({
  open,
  passageiroId,
  passageiroNome,
  initialCpf = "",
  initialEmail = "",
  initialCep = "",
  initialLogradouro = "",
  initialNumero = "",
  initialComplemento = "",
  initialBairro = "",
  initialCidade = "",
  initialEstado = "",
  initialReferencia = "",
  token,
  onSuccess
}) => {
  const [loading, setLoading] = React.useState(false);

  const needsCpf = !initialCpf || initialCpf.trim() === "";
  const needsEmail = !initialEmail || initialEmail.trim() === "";
  const needsAddress = !initialLogradouro || initialLogradouro.trim() === "" || !initialCep || initialCep.trim() === "";
  const needsPersonalData = needsCpf || needsEmail;

  const validationSchema = React.useMemo(() => {
    return complementaresSchema.superRefine((data, ctx) => {
      if (needsCpf) {
        if (!data.cpf || !data.cpf.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF é obrigatório", path: ["cpf"] });
        } else if (!isValidCPF(data.cpf)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF inválido", path: ["cpf"] });
        }
      }

      if (needsEmail) {
        if (!data.email || !data.email.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "E-mail é obrigatório", path: ["email"] });
        } else if (!z.string().email().safeParse(data.email.trim()).success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Digite um endereço de e-mail válido.", path: ["email"] });
        }
      }

      if (needsAddress) {
        if (!data.cep || !data.cep.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CEP é obrigatório", path: ["cep"] });
        } else if (!isValidCEPFormat(data.cep)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Formato de CEP inválido (00000-000)", path: ["cep"] });
        }
        if (!data.logradouro || !data.logradouro.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Logradouro é obrigatório", path: ["logradouro"] });
        }
        if (!data.numero || !data.numero.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número é obrigatório", path: ["numero"] });
        }
        if (!data.bairro || !data.bairro.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bairro é obrigatório", path: ["bairro"] });
        }
        if (!data.cidade || !data.cidade.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cidade é obrigatória", path: ["cidade"] });
        }
        if (!data.estado || !data.estado.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Estado é obrigatório", path: ["estado"] });
        }
      }
    });
  }, [needsCpf, needsEmail, needsAddress]);

  const form = useForm<ComplementaresFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      cpf: initialCpf ? cpfMask(initialCpf) : "",
      email: initialEmail || "",
      cep: initialCep || "",
      logradouro: initialLogradouro || "",
      numero: initialNumero || "",
      complemento: initialComplemento || "",
      bairro: initialBairro || "",
      cidade: initialCidade || "",
      estado: initialEstado || "",
      referencia: initialReferencia || ""
    }
  });

  React.useEffect(() => {
    if (open) {
      setLoading(false);
      form.reset({
        cpf: initialCpf ? cpfMask(initialCpf) : "",
        email: initialEmail || "",
        cep: initialCep || "",
        logradouro: initialLogradouro || "",
        numero: initialNumero || "",
        complemento: initialComplemento || "",
        bairro: initialBairro || "",
        cidade: initialCidade || "",
        estado: initialEstado || "",
        referencia: initialReferencia || ""
      });
    }
  }, [
    open,
    initialCpf,
    initialEmail,
    initialCep,
    initialLogradouro,
    initialNumero,
    initialComplemento,
    initialBairro,
    initialCidade,
    initialEstado,
    initialReferencia,
    form
  ]);

  const handleSubmit = async (values: ComplementaresFormValues) => {
    const cleanCpf = values.cpf ? values.cpf.replace(/\D/g, "") : (initialCpf ? initialCpf.replace(/\D/g, "") : undefined);
    const emailValue = values.email ? values.email.trim() : (initialEmail ? initialEmail.trim() : undefined);

    setLoading(true);

    try {
      await responsavelApi.updateDadosComplementares(
        passageiroId,
        token,
        {
          ...(cleanCpf ? { cpf: cleanCpf } : {}),
          ...(emailValue ? { email: emailValue } : {}),
          ...(needsAddress ? {
            cep: values.cep ? values.cep.replace(/\D/g, "") : null,
            logradouro: values.logradouro ? values.logradouro.trim() : null,
            numero: values.numero ? values.numero.trim() : null,
            complemento: values.complemento ? values.complemento.trim() : null,
            bairro: values.bairro ? values.bairro.trim() : null,
            cidade: values.cidade ? values.cidade.trim() : null,
            estado: values.estado ? values.estado.trim().toUpperCase() : null,
            referencia: values.referencia ? values.referencia.trim() : null,
          } : {})
        }
      );
      await onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Erro ao salvar dados cadastrais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={() => { }} lockClose={true} maxWidth={needsAddress ? "xl" : "md"}>
      <BaseDialog.Header
        title="Atualização Cadastral"
        icon={<UserCheck className="w-5 h-5 text-[#0a0a0a]" />}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form id="form-dados-complementares" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-2 text-left">
            <Banner
              variant="warning"
              title="Por favor, complete as informações pendentes do seu cadastro para continuar."
            />

            {needsPersonalData && (
              <section className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a] mb-3">
                  <div className="w-8 h-8 rounded-[12px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a] border border-[#e5e5e5] shadow-xs shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  Dados Pessoais
                </div>

                <div className={`grid gap-4 ${needsCpf && needsEmail ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                  {needsCpf && (
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Seu CPF <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IdCard className="absolute left-4 top-3 h-4 w-4 text-[#737373]" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                type="text"
                                placeholder="000.000.000-00"
                                onChange={(e) => field.onChange(cpfMask(e.target.value))}
                                className="pl-11 h-10 sm:h-11 text-sm rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:border-[#0a0a0a] focus:bg-white text-[#0a0a0a] font-normal"
                                disabled={loading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5" />
                        </FormItem>
                      )}
                    />
                  )}

                  {needsEmail && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Seu E-mail <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-4 top-3 h-4 w-4 text-[#737373]" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                type="email"
                                placeholder="seu.email@exemplo.com"
                                className="pl-11 h-10 sm:h-11 text-sm rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:border-[#0a0a0a] focus:bg-white text-[#0a0a0a] font-normal"
                                disabled={loading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </section>
            )}

            {needsPersonalData && needsAddress && (
              <hr className="border-[#e5e5e5]" />
            )}

            {needsAddress && (
              <section className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a] mb-3">
                  <div className="w-8 h-8 rounded-[12px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a] border border-[#e5e5e5] shadow-xs shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  Endereço
                </div>
                <FormEnderecoFields required={true} />
              </section>
            )}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Salvar e Continuar"
          variant="primary"
          form="form-dados-complementares"
          type="submit"
          isLoading={loading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
