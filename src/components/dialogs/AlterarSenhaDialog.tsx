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
import { toast } from "@/utils/notifications/toast";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface AlterarSenhaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = z
  .object({
    senhaAtual: z
      .string()
      .min(6, "A senha atual deve ter pelo menos 6 caracteres"),
    novaSenha: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string().min(6, "Confirme a nova senha"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não coincidem",
  });

type FormData = z.infer<typeof schema>;

export default function AlterarSenhaDialog({
  isOpen,
  onClose,
}: AlterarSenhaDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (!profile?.cpfcnpj) {
      toast.error("erro.operacao", {
        description: "Não foi possível identificar o usuário logado.",
      });
      return;
    }

    if (data.senhaAtual === data.novaSenha) {
      toast.error("erro.operacao", {
        description: "A nova senha deve ser diferente da senha atual.",
      });
      return;
    }

    try {
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("email")
        .eq("cpfcnpj", profile.cpfcnpj)
        .maybeSingle();

      if (userError || !usuario?.email) {
        throw new Error(
          "Não foi possível encontrar o e-mail vinculado ao usuário."
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: data.senhaAtual,
      });

      if (signInError) {
        toast.error("auth.erro.senhaIncorreta", {
          description: "A senha atual informada está incorreta.",
        });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.novaSenha,
      });

      if (updateError) throw updateError;

      toast.success("auth.sucesso.senhaAlterada", {
        description: "Você será desconectado para acessar com a nova senha.",
      });

      await new Promise((res) => setTimeout(res, 1500));

      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err: any) {
      toast.error("erro.operacao", {
        description: err.message || "Ocorreu um erro ao tentar alterar a senha.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md max-h-[95vh] overflow-y-auto bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="senhaAtual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha atual"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="novaSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite a nova senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repita a nova senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
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
      </DialogContent>
    </Dialog>
  );
}
