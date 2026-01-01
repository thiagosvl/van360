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
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { emailSchema, phoneSchema } from "@/schemas/common";
import { pixKeyObject, pixKeyRefinement } from "@/schemas/pix";
import { usuarioApi } from "@/services/api/usuario.api";
import { TIPOS_CHAVE_PIX_LABEL, TipoChavePix } from "@/types/pix";
import { cnpjMask, cpfMask as maskCpf, phoneMask as maskPhone } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Key, Loader2, Mail, User, X } from "lucide-react";
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
}).merge(pixKeyObject);

const schema = basicSchema.superRefine(pixKeyRefinement);

type FormData = z.infer<typeof schema>;

export default function EditarCadastroDialog({
  isOpen,
  onClose,
}: EditarCadastroDialogProps) {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-pessoais",
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      apelido: "",
      cpfcnpj: "",
      telefone: "",
      email: "",
      tipo_chave_pix: undefined,
      chave_pix: ""
    },
  });
  
  const tipoPixSelecionado = form.watch("tipo_chave_pix");

  // Carrega dados do perfil no form
  React.useEffect(() => {
    if (profile) {
      form.reset({
        nome: profile.nome || "",
        apelido: profile.apelido || "",
        cpfcnpj: maskCpf(profile.cpfcnpj) || "",
        telefone: profile.telefone ? maskPhone(profile.telefone) : "",
        email: profile.email || "",
        tipo_chave_pix: (profile.tipo_chave_pix as TipoChavePix) || undefined,
        chave_pix: profile.chave_pix || ""
      });
      // Abre ambas as sections se já tiver dados, ou apenas a primeira
      setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
    }
  }, [profile, form]);

    const handleChavePixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (tipoPixSelecionado === TipoChavePix.CPF) {
            value = maskCpf(value);
        } else if (tipoPixSelecionado === TipoChavePix.CNPJ) {
            value = cnpjMask(value);
        } else if (tipoPixSelecionado === TipoChavePix.TELEFONE) {
            value = maskPhone(value);
        }
        form.setValue("chave_pix", value);
    };

  const handleSubmit = async (data: FormData) => {
    try {
      const nome = cleanString(data.nome, true);
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");

      await usuarioApi.atualizarUsuario(profile.id, {
          nome,
          apelido,
          telefone,
          chave_pix: data.chave_pix || undefined,
          tipo_chave_pix: data.tipo_chave_pix || undefined
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
       setOpenAccordionItems(["dados-pessoais", "dados-recebimento"]);
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
          <DialogDescription className="text-blue-100/80 text-sm mt-1">
             Atualize suas informações de perfil e recebimento.
          </DialogDescription>
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
                                <FormLabel className="text-gray-700 font-medium ml-1">Nome completo</FormLabel>
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
                                    <FormLabel className="text-gray-700 font-medium ml-1">CPF</FormLabel>
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
                                    <FormLabel className="text-gray-700 font-medium ml-1">E-mail</FormLabel>
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
                  
                  <AccordionItem value="dados-recebimento" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-2">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Key className="w-5 h-5 text-blue-600" />
                            Dados de Recebimento
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tipo_chave_pix"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium ml-1">Tipo de Chave</FormLabel>
                                    <Select 
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue("chave_pix", ""); // Limpa chave ao trocar tipo
                                        }} 
                                        value={field.value || undefined}
                                    >
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Selecione o tipo..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(TIPOS_CHAVE_PIX_LABEL).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="chave_pix"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium ml-1">Chave PIX</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder={tipoPixSelecionado ? "Digite a chave" : "Selecione o tipo primeiro"}
                                            {...field}
                                            value={field.value || ""}
                                            disabled={!tipoPixSelecionado}
                                            maxLength={tipoPixSelecionado === TipoChavePix.CPF ? 14 : tipoPixSelecionado === TipoChavePix.CNPJ ? 18 : 100}
                                            onChange={handleChavePixChange}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 pr-10"
                                        />
                                        {tipoPixSelecionado && field.value && !form.formState.errors.chave_pix && (
                                            <div className="absolute right-3 top-3.5 text-green-500 animate-in fade-in zoom-in">
                                                <Check className="w-5 h-5" />
                                            </div>
                                        )}
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
        </div>

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
