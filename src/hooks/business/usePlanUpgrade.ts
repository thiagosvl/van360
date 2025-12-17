import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { usuarioApi } from "@/services/api/usuario.api";
import { toast } from "@/utils/notifications/toast";
import { useState } from "react";

interface UsePlanUpgradeProps {
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function usePlanUpgrade({ onSuccess, onOpenChange }: UsePlanUpgradeProps = {}) {
  const { user } = useSession();
  const { profile, refreshProfile } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  
  const [pagamentoDialog, setPagamentoDialog] = useState<{
    isOpen: boolean;
    cobrancaId: string;
    valor: number;
    nomePlano: string;
    franquia?: number;
    context?: "register" | "upgrade";
    initialData?: {
        qrCodePayload: string;
        location: string;
        inter_txid: string;
        cobrancaId: string;
    };
  } | null>(null);


  const handleUpgradeEssencial = async (planoEssencialId?: string) => {
    if (!profile?.id) {
        toast.error("Erro de perfil", { description: "Usuário não identificado." });
        return;
    }
    if (!planoEssencialId) return;

    try {
      setLoading(true);

      const result = await usuarioApi.upgradePlano({
        usuario_id: profile.id,
        plano_id: planoEssencialId,
      });

      if (result.qrCodePayload && result.cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String(result.cobrancaId),
          valor: Number(result.preco_aplicado || result.valor || 0),
          nomePlano: "Plano Essencial",
          context: "upgrade",
          initialData: {
             qrCodePayload: result.qrCodePayload,
             location: result.location,
             inter_txid: result.inter_txid,
             cobrancaId: String(result.cobrancaId)
          }
        });
      } else {
        await refreshProfile();
        toast.success("Plano atualizado com sucesso!");
        onSuccess?.();
        onOpenChange?.(false);
      }
    } catch (error: any) {
      console.error("Erro upgrade essencial:", error);
      toast.error("Erro ao atualizar plano", {
        description: error.response?.data?.error || "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeProfissional = async (targetId?: string, targetPlan?: any) => {
    if (!profile?.id) {
      toast.error("Erro de perfil", { description: "Usuário não identificado." });
      return;
    }

    if (!targetId) {
      toast.error("Erro de configuração", {
        description: "Plano não disponível no momento.",
      });
      return;
    }

    try {
      setLoading(true);

      // Backend refatorado para lidar com user sem assinatura (Free/Inativo)
      // Endpoint unificado de upgrade para todos os casos
      const result = await usuarioApi.upgradePlano({
        usuario_id: profile.id,
        plano_id: targetId,
        quantidade_personalizada: targetPlan?.isCustom ? targetPlan.quantidade : undefined
      });

      if (result.qrCodePayload && result.cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String(result.cobrancaId),
          valor: Number(result.preco_aplicado || result.valor || 0),
          nomePlano: "Plano Profissional",
          franquia: targetPlan?.quantidade,
          context: "upgrade",
          initialData: {
             qrCodePayload: result.qrCodePayload,
             location: result.location,
             inter_txid: result.inter_txid,
             cobrancaId: String(result.cobrancaId)
          }
        });
      } else {
        await refreshProfile();
        toast.success("Plano atualizado com sucesso!");
        onSuccess?.();
        onOpenChange?.(false);
      }
    } catch (error: any) {
      console.error("Erro upgrade profissional:", error);
      toast.error("Erro ao atualizar plano", {
        description: error.response?.data?.error || "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePayment = (success?: boolean) => {
    setPagamentoDialog(null);
    // Fecha nível 2 SOMENTE se houve sucesso explícito OU verificado anteriormente
    if (success === true || isPaymentVerified) {
      toast.success("Parabéns! Você alterou de plano.", {
        description: "Aproveite todos os novos recursos exclusivos.",
        duration: 4000
      });
      onOpenChange?.(false);
      onSuccess?.();
    }
  };

  return {
    loading,
    pagamentoDialog,
    isPaymentVerified,
    setIsPaymentVerified,
    handleUpgradeEssencial,
    handleUpgradeProfissional,
    handleClosePayment,
    setPagamentoDialog // Exporting setter in case we need manual control, though ideally not
  };
}
