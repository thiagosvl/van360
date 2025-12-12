import { PhoneInput } from "@/components/forms";
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
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { supabase } from "@/integrations/supabase/client";
import { cpfSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { cpfMask, phoneMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User, X } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditarCadastroDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = z.object({
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  cpfcnpj: cpfSchema,
  telefone: phoneSchema,
  email: emailSchema,
});

type FormData = z.infer<typeof schema>;

export default function EditarCadastroDialog({
  isOpen,
  onClose,
}: EditarCadastroDialogProps) {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
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
        cpfcnpj: cpfMask(profile.cpfcnpj) || "",
        telefone: profile.telefone ? phoneMask(profile.telefone) : "",
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      const nome = cleanString(data.nome, true);
      const apelido = cleanString(data.apelido || "", true);
      const telefone = data.telefone.replace(/\D/g, "");

      const { data: existingUsers, error: existingError } = await supabase
        .from("usuarios")
        .select("id, telefone")
        .eq("telefone", telefone)
        .neq("id", profile.id);

      if (existingError) throw existingError;

      if (existingUsers && existingUsers.length > 0) {
        toast.error("cadastro.erro.atualizar");
        return;
      }

      const { error } = await supabase
        .from("usuarios")
        .update({
          nome,
          apelido,
          telefone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[90vw] sm:w-full sm:max-w-md max-h-[95vh] flex flex-col overflow-hidden bg-white rounded-3xl border-0 shadow-2xl p-0"
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
             Atualize suas informações de perfil.
          </DialogDescription>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 p-6 pt-2"
            >
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
                          className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                          className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                    inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                )}
              />

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

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={form.formState.isSubmitting}
                  className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                  className="flex-1 h-12 rounded-xl shadow-lg shadow-blue-500/20 font-semibold text-base"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
