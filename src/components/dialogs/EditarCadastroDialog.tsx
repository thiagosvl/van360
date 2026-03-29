import { PhoneInput } from "@/components/forms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { emailSchema, phoneSchema } from "@/schemas/common";
import { usuarioApi } from "@/services/api/usuario.api";
import { cpfMask as maskCpf, phoneMask as maskPhone } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditarCadastroDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const basicSchema = z.object({
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  apelido: z.string().optional(),
  cpfcnpj: z.string(),
  telefone: phoneSchema,
  email: emailSchema,
});

type FormData = z.infer<typeof basicSchema>;

export default function EditarCadastroDialog({ isOpen, onClose }: EditarCadastroDialogProps) {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const [openAccordionItems, setOpenAccordionItems] = useState(["dados-pessoais"]);

  const form = useForm<FormData>({
    resolver: zodResolver(basicSchema),
    defaultValues: { nome: "", apelido: "", cpfcnpj: "", telefone: "", email: "" },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        nome: profile.nome || "",
        apelido: profile.apelido || "",
        cpfcnpj: maskCpf(profile.cpfcnpj) || "",
        telefone: profile.telefone ? maskPhone(profile.telefone) : "",
        email: profile.email || "",
      });
      setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
    }
  }, [profile, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;
      const nome = cleanString(data.nome, true);
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");
      await usuarioApi.atualizarUsuario(profile.id, { nome, apelido, telefone });
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
            <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-6">
              <Accordion
                type="multiple"
                value={openAccordionItems}
                onValueChange={setOpenAccordionItems}
                className="w-full space-y-4"
              >
                <AccordionItem value="dados-pessoais" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <User className="w-5 h-5 text-blue-600" />
                      Dados Pessoais
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium ml-1">
                            Nome completo <span className="text-red-500">*</span>
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
                          <FormLabel className="text-gray-700 font-medium ml-1">Apelido</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <PhoneInput
                          field={field}
                          label="WhatsApp"
                          placeholder="(00) 00000-0000"
                          required
                          inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200"
                        />
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="cpfcnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium ml-1">
                              CPF <span className="text-red-500">*</span>
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
                            <FormLabel className="text-gray-700 font-medium ml-1">
                              E-mail <span className="text-red-500">*</span>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
