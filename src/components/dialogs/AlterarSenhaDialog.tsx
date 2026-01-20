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
import { ROUTES } from "@/constants/routes";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { apiClient } from "@/services/api/client";
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
      // Backend validates oldPassword and updates to newPassword
      const { data: response } = await apiClient.post("/auth/update-password", {
          oldPassword: data.senhaAtual,
          password: data.novaSenha
      });

      if (!response.success) {
          throw new Error(response.message || "Erro ao atualizar senha.");
      }

      toast.success("auth.sucesso.senhaAlterada", {
        description: "Você será desconectado para acessar com a nova senha.",
      });

      await new Promise((res) => setTimeout(res, 1500));

      // Logout to force re-login
      await apiClient.post("/auth/logout");
      
      window.location.href = ROUTES.PUBLIC.LOGIN;
    } catch (err: any) {
      toast.error("erro.operacao", {
        description: err.userMessage || err.message || "Ocorreu um erro ao tentar alterar a senha.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
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

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              id="alterar-senha-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 pt-4"
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
            </form>
          </Form>
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
            form="alterar-senha-form"
            type="submit" 
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
