import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { cleanString } from "@/utils/formatters";
import { cpfMask, phoneMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditarPerfilDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  apelido: z.string().optional(),
  cpfcnpj: z.string(),
  telefone: z
    .string()
    .min(1, "Campo obrigatório")
    .refine(
      (val) => val.replace(/\D/g, "").length === 11,
      "O formato aceito é (00) 00000-0000"
    ),
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export default function EditarPerfilDialog({
  isOpen,
  onClose,
}: EditarPerfilDialogProps) {
  const { toast } = useToast();
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
        telefone: phoneMask(profile.telefone) || "",
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
        toast({
          title: "Telefone já cadastrado",
          description: "O telefone informado já está em uso por outro usuário.",
          variant: "destructive",
        });
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

      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas.",
      });

      await refreshProfile();
      onClose();
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      toast({
        title: "Erro ao atualizar perfil",
        description: err.message || "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
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
                    <FormLabel>Apelido (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Como prefere ser chamado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpfcnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-gray-100 cursor-not-allowed" />
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
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
