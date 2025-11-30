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
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2, Lock, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface AlterarSenhaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = z.object({
  senhaAtual: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres"),
  novaSenha: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function AlterarSenhaDialog({
  isOpen,
  onClose,
}: AlterarSenhaDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
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
        className="w-[90vw] sm:w-full sm:max-w-md max-h-[95vh] flex flex-col overflow-hidden bg-white rounded-3xl border-0 shadow-2xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Alterar Senha
          </DialogTitle>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 p-6 pt-2"
          >
            <FormField
              control={form.control}
              name="senhaAtual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium ml-1">Senha atual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        {...field}
                        className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
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
                  <FormLabel className="text-gray-700 font-medium ml-1">Nova senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Digite a nova senha"
                        {...field}
                        className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
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
                  "Salvar Nova Senha"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
