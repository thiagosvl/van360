import { Switch } from "@/components/ui/switch";
import { useUpdatePassageiro } from "@/hooks";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { Passageiro } from "@/types/passageiro";
import { Bot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SubscriptionStatus } from "@/types/enums";

interface CarteirinhaNotificacoesProps {
  passageiro: Passageiro;
}

export const CarteirinhaNotificacoes = ({
  passageiro,
}: CarteirinhaNotificacoesProps) => {
  const { user } = useSession();
  const { subscription, isLoading: isSubLoading } = useSubscriptionStatus(user?.id);
  const updatePassageiro = useUpdatePassageiro();

  const hasAddon = subscription?.status === SubscriptionStatus.ACTIVE || subscription?.status === SubscriptionStatus.TRIAL;

  const [isUpdating, setIsUpdating] = useState(false);

  if (isSubLoading) return null;

  if (!hasAddon) {
    return null;
  }

  const handleToggleNotificacoes = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updatePassageiro.mutateAsync({
        id: passageiro.id!,
        data: {
          enviar_notificacoes: checked,
        },
      });
      toast.success(checked ? "Notificações de cobrança ATIVADAS" : "Notificações de cobrança DESATIVADAS");
    } catch (e) {
      toast.error("Erro ao atualizar a configuração de notificações.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden p-5 mb-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple-50/80 flex items-center justify-center border border-purple-100/50">
          <Bot className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h3 className="text-sm font-headline font-black text-[#1a3a5c]">
            Notificações & Lembretes
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Configure as regras de lembretes automáticos de cobrança.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center justify-between border border-slate-100/50">
          <div className="mr-4">
            <span className="text-sm font-bold text-[#1a3a5c] block mb-0.5">
              Lembretes no WhatsApp
            </span>
            <span className="text-[10px] text-slate-500 leading-tight block">
              Gera a parcela e envia notificação no WhatsApp com sua chave Pix por extenso automaticamente.
            </span>
          </div>
          <Switch
            checked={!!passageiro.enviar_notificacoes}
            onCheckedChange={handleToggleNotificacoes}
            disabled={isUpdating}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
