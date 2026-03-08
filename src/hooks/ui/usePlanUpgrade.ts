import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { usuarioApi } from "@/services/api/usuario.api";
import { AssinaturaStatus } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { useState } from "react";

interface UsePlanUpgradeProps {
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function usePlanUpgrade({ onSuccess, onOpenChange }: UsePlanUpgradeProps = {}) {
  const { user } = useSession();
  // Destructure plano as well to get computed status (IsProfissionalPlan, etc)
  const { profile, plano, refreshProfile } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);

  const [pagamentoDialog, setPagamentoDialog] = useState<{
    isOpen: boolean;
    cobrancaId: string;
    valor: number;
    nomePlano: string;
    franquia?: number;
    context?: "register" | "upgrade" | "expansion";
    initialData?: {
      qrCodePayload: string;
      location: string;
      gateway_txid: string;
      cobrancaId: string;
    };
  } | null>(null);


  const handleUpgradeEssencial = async (planoEssencialId?: string) => {
    if (!profile?.id) {
      toast.error("sistema.erro.motoristaNaoIdentificado");
      return;
    }
    if (!planoEssencialId) return;

    try {
      setLoading(true);

      // Use the computed plano object
      const isProfissional = plano?.is_profissional;

      let result;
      // Se estiver no profissional e quiser ir para essencial -> Downgrade
      if (isProfissional) {
        result = await usuarioApi.downgradePlano({
          usuario_id: profile.id,
          plano_id: planoEssencialId
        });
      } else {
        // Se estiver em trial ou ativação -> Upgrade
        result = await usuarioApi.upgradePlano({
          usuario_id: profile.id,
          plano_id: planoEssencialId,
        });
      }

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
            gateway_txid: result.gateway_txid,
            cobrancaId: String(result.cobrancaId)
          }
        });
      } else {
        await refreshProfile();
        toast.success("plano.sucesso.atualizado");
        onSuccess?.();
        onOpenChange?.(false);
      }
    } catch (error: any) {
      console.error("Erro upgrade/downgrade essencial:", error);
      toast.error("plano.erro.escolher");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeProfissional = async (targetId?: string, targetPlan?: any) => {
    if (!profile?.id) {
      toast.error("sistema.erro.motoristaNaoIdentificado");
      return;
    }

    if (!targetId && !targetPlan?.isCustom) {
      toast.error("plano.erro.carregar");
      return;
    }

    try {
      setLoading(true);

      // Use the computed plano object for reliable detection
      const isAlreadyProfissional = plano?.is_profissional;

      let result;

      if (isAlreadyProfissional) {
        // --- Fluxo de Troca de Capacidade (Subplano) ---

        // Se o plano alvo é o mesmo que o atual e o sistema está restrito, 
        // usamos o endpoint de regularização para logs mais precisos
        const currentAssinatura = profile.assinatura || profile.assinaturas_usuarios?.[0];
        const isSamePlan = targetId === currentAssinatura?.plano_id;
        const isRestricted = plano?.is_suspensa || plano?.is_cancelada || 
                            plano?.status === AssinaturaStatus.SUSPENSA || 
                            plano?.status === AssinaturaStatus.CANCELADA;

        if (isSamePlan && isRestricted) {
          result = await usuarioApi.regularizarAssinatura({ usuario_id: profile.id });
        }
        // Cenario 1: Customizado (Quantidade > tiers padrão)
        else if (targetPlan?.isCustom) {
          result = await usuarioApi.criarAssinaturaProfissionalPersonalizado({
            usuario_id: profile.id,
            quantidade: targetPlan.quantidade
          });
        }
        // Cenario 2: Subplano Padrão (6, 8, 10 vagas...)
        else if (targetId) {
          result = await usuarioApi.trocarSubplano({
            usuario_id: profile.id,
            subplano_id: targetId
          });
        }
      } else {
        // Aqui usamos upgradePlano, mas ele suporta quantidade personalizada tb
        result = await usuarioApi.upgradePlano({
          usuario_id: profile.id,
          plano_id: targetId || "",
          quantidade_personalizada: targetPlan?.isCustom ? targetPlan.quantidade : undefined
        });
      }

      if (result.qrCodePayload && result.cobrancaId) {
        setPagamentoDialog({
          isOpen: true,
          cobrancaId: String(result.cobrancaId),
          valor: Number(result.preco_aplicado || result.valor || 0),
          nomePlano: "Plano Profissional",
          franquia: targetPlan?.quantidade,
          context: isAlreadyProfissional ? "expansion" : "upgrade",
          initialData: {
            qrCodePayload: result.qrCodePayload,
            location: result.location,
            gateway_txid: result.gateway_txid,
            cobrancaId: String(result.cobrancaId)
          }
        });
      } else if (result.success) {
        // Se já teve sucesso sem pagamento (ex: redução de plano ou valor zero)
        await refreshProfile();

        if (isAlreadyProfissional) {
          toast.success("assinatura.sucesso.limiteAtualizado", { 
            description: "assinatura.sucesso.limiteAtualizadoDescricao" 
          });
        } else {
          toast.success("assinatura.sucesso.bemVindoProfissional", { 
            description: "assinatura.sucesso.bemVindoProfissionalDescricao" 
          });
        }
        
        onSuccess?.();
        onOpenChange?.(false);
      }
    } catch (error: any) {
      console.error("Erro upgrade profissional:", error);
      toast.error("plano.erro.escolher");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePayment = async (success?: boolean, customMessage?: { title: string, description: string }) => {
    // Captura o contexto antes de limpar o estado
    const context = pagamentoDialog?.context;
    setPagamentoDialog(null);

    // Se houve sucesso (ex: confirmou pagamento ou foi operação gratuita), atualizamos tudo
    if (success === true || isPaymentVerified) {
      await refreshProfile();

      if (customMessage) {
        toast.success(customMessage.title, {
          description: customMessage.description,
          duration: 4000
        });
      } else {
        // Mensagens contextuais baseadas no tipo de operação
        if (context === "expansion") {
          toast.success("assinatura.sucesso.limiteAtualizado", {
            description: "assinatura.sucesso.limiteAtualizadoDescricao",
          });
        } else if (context === "upgrade") {
          toast.success("assinatura.sucesso.bemVindoProfissional", {
            description: "assinatura.sucesso.bemVindoProfissionalDescricao",
          });
        } else {
          toast.success("sucesso.operacao");
        }
      }
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
    setPagamentoDialog
  };
}
