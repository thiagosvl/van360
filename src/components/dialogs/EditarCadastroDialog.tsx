import { PhoneInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { emailSchema, phoneSchema } from "@/schemas/common";
import { usuarioApi } from "@/services/api/usuario.api";
import { cpfCnpjMask as maskCpf, phoneMask as maskPhone, dateMask as maskDate } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Loader2, Mail, User } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditarCadastroDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function EditarCadastroDialog({ isOpen, onClose }: EditarCadastroDialogProps) {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const [openAccordionItems, setOpenAccordionItems] = useState(["dados-pessoais"]);

  const form = useForm<FormData>({
    resolver: zodResolver(basicSchema),
    defaultValues: { nome: "", apelido: "", cpfcnpj: "", razao_social: "", telefone: "", email: "", data_nascimento: "" },
  });

  React.useEffect(() => {
    if (profile) {
      const formatBirth = () => {
        if (!profile.data_nascimento) return "";
        const clean = profile.data_nascimento.trim();
        if (clean.includes("-")) {
          const parts = clean.split("-");
          if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
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
      setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
    }
  }, [profile, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;
      const nome = cleanString(data.nome, true);
      const razao_social = data.razao_social ? cleanString(data.razao_social, true) : undefined;
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");
      const data_nascimento = data.data_nascimento;
      await usuarioApi.atualizarUsuario(profile.id, { nome, razao_social, apelido, telefone, data_nascimento });
      toast.success("cadastro.sucesso.perfilAtualizado", {
        description: "cadastro.sucesso.perfilAtualizadoDescricao",
      });
      await refreshProfile();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error("cadastro.erro.atualizar", { description: errorMessage });
      setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
    setOpenAccordionItems(["dados-pessoais"]);
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Editar Cadastro" icon={<User className="w-5 h-5" />} onClose={onClose} />
      <BaseDialog.Body>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-6 mt-1">
            {(() => {
              const cpfcnpjValue = form.watch("cpfcnpj") || "";
              const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;
              return (
                <>
                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name="cpfcnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            CPF ou CNPJ <span className="text-red-600">*</span>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="razao_social"
                    render={({ field, fieldState, formState }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Razão Social {isCnpj && <span className="text-red-600">*</span>}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Digite a razão social"
                              {...field}
                              value={field.value || ""}
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                            Apelido
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <PhoneInput
                          field={field}
                          label="WhatsApp"
                          placeholder="(00) 00000-0000"
                          required
                          labelClassName="text-slate-700 font-semibold ml-1"
                          inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                        />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            E-mail <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
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
                </>
              );
            })()}
            </form>
          </Form>
        )}

      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={form.formState.isSubmitting} />
        <BaseDialog.Action
          label="Salvar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={form.formState.isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
