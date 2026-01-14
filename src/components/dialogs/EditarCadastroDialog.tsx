import DeleteAccountDialog from "@/components/dialogs/DeleteAccountDialog";
import { PhoneInput } from "@/components/forms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
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
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { emailSchema, phoneSchema } from "@/schemas/common";
import { usuarioApi } from "@/services/api/usuario.api";
import { cpfMask as maskCpf, phoneMask as maskPhone } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditarCadastroDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const basicSchema = z.object({
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  cpfcnpj: z.string(), // Apenas leitura/exibição
  telefone: phoneSchema,
  email: emailSchema,
});

type FormData = z.infer<typeof basicSchema>;

export default function EditarCadastroDialog({
  isOpen,
  onClose,
}: EditarCadastroDialogProps) {
  const { user } = useSession();
  const { openPixKeyDialog } = useLayout();
  // Usar usePermissions para acesso centralizado às flags de plano
  const { profile, isLoading, refreshProfile, isProfissional } = usePermissions();
  
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-pessoais",
  ]);
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      nome: "",
      apelido: "",
      cpfcnpj: "",
      telefone: "",
      email: "",
    },
  });
  
  // Carrega dados do perfil no form
  React.useEffect(() => {
    if (profile) {
      form.reset({
        nome: profile.nome || "",
        apelido: profile.apelido || "",
        cpfcnpj: maskCpf(profile.cpfcnpj) || "",
        telefone: profile.telefone ? maskPhone(profile.telefone) : "",
        email: profile.email || "",
      });
      // Abre ambas as sections se já tiver dados e for profissional
      if (isProfissional) {
        setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
      } else {
        setOpenAccordionItems(["dados-pessoais"]);
      }
    }
  }, [profile, form, isProfissional]);

  const handleSubmit = async (data: FormData) => {
    try {
      const nome = cleanString(data.nome, true);
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");

      await usuarioApi.atualizarUsuario(profile.id, {
          nome,
          apelido,
          telefone,
      });

      toast.success("cadastro.sucesso.perfilAtualizado", {
        description: "cadastro.sucesso.perfilAtualizadoDescricao",
      });

      await refreshProfile();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error("cadastro.erro.atualizar", {
        description: errorMessage,
      });
      setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
    }
  };

  const onFormError = () => {
       toast.error("Verifique os campos obrigatórios");
       setOpenAccordionItems(["dados-pessoais"]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Editar Perfil
          </DialogTitle>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-6"
            >
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
                                <FormLabel className="text-gray-700 font-medium ml-1">Nome completo <span className="text-red-500">*</span></FormLabel>
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
                                <FormLabel className="text-gray-700 font-medium ml-1">Apelido <span className="text-red-500">*</span></FormLabel>
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
                                    <FormLabel className="text-gray-700 font-medium ml-1">CPF <span className="text-red-500">*</span></FormLabel>
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
                                    <FormLabel className="text-gray-700 font-medium ml-1">E-mail <span className="text-red-500">*</span></FormLabel>
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

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-700 mb-3">
                    Deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.
                </p>
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenDeleteAccount(true)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-colors"
                >
                    Excluir minha conta
                </Button>
            </div>
          </div>
        </div>
        
        {openDeleteAccount && (
            <DeleteAccountDialog 
                isOpen={openDeleteAccount} 
                onClose={() => setOpenDeleteAccount(false)}
            />
        )}

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSubmit, onFormError)}
            disabled={form.formState.isSubmitting}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
