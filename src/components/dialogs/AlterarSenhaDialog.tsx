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
import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { safeCloseDialog } from "@/hooks";
import { apiClient } from "@/services/api/client";
import { toast } from "@/utils/notifications/toast";
import { getErrorMessage } from "@/utils/errorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
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

export default function AlterarSenhaDialog({ isOpen, onClose }: AlterarSenhaDialogProps) {
  const { user } = useSession();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { senhaAtual: "", novaSenha: "" },
  });

  const handleClose = () => {
    if (form.formState.isSubmitting) return;
    form.reset();
    safeCloseDialog(onClose);
  };

  const handleSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error("erro.operacao", { description: "Não foi possível identificar o usuário logado." });
      return;
    }
    if (data.senhaAtual === data.novaSenha) {
      toast.error("erro.operacao", { description: "A nova senha deve ser diferente da senha atual." });
      return;
    }
    try {
      const { data: response } = await apiClient.post("/auth/update-password", {
        oldPassword: data.senhaAtual,
        password: data.novaSenha,
      });
      if (!response.success) throw new Error(response.message || "Erro ao atualizar senha.");
      toast.success("auth.sucesso.senhaAlterada", { description: "Você será desconectado para acessar com a nova senha." });
      await new Promise((res) => setTimeout(res, 1500));
      await apiClient.post("/auth/logout");
      window.location.href = ROUTES.PUBLIC.LOGIN;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Ocorreu um erro ao tentar alterar a senha.");
      toast.error("erro.operacao", { description: message });
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={handleClose} maxWidth="sm">
      <BaseDialog.Header
        title="Alterar senha"
        subtitle="Escolha uma senha forte com no mínimo 6 caracteres."
        icon={<KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="senhaAtual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                    Senha atual <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        {...field}
                        className="pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                    Nova senha <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Digite a nova senha"
                        {...field}
                        className="pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={form.formState.isSubmitting}
        />
        <BaseDialog.Action
          label="Salvar senha"
          onClick={form.handleSubmit(handleSubmit)}
          isLoading={form.formState.isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
