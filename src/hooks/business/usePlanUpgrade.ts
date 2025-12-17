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
  } | null>(null);

  const handleUpgradeEssencial = async (planoEssencialId?: string) => {
    if (!planoEssencialId) return;

    try {
      setLoading(true);
      const result = await usuarioApi.upgradePlano({
        usuario_id: profile?.id || user?.id,
        plano_id: planoEssencialId,
      });

      if (result.qrCodePayload && result.cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String(result.cobrancaId),
          valor: Number(result.preco_aplicado || result.valor || 0),
          nomePlano: "Plano Essencial",
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
    if (!targetId) {
      toast.error("Erro de configuração", {
        description: "Plano não disponível no momento.",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await usuarioApi.upgradePlano({
        usuario_id: profile?.id || user?.id,
        plano_id: targetId,
      });

      if (result.qrCodePayload && result.cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String(result.cobrancaId),
          valor: Number(result.preco_aplicado || result.valor || 0),
          nomePlano: "Plano Profissional",
          franquia: targetPlan?.quantidade,
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

  const handleClosePayment = () => {
    setPagamentoDialog(null);
    if (isPaymentVerified) {
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
