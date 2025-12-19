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
    context?: "register" | "upgrade" | "franchise_upgrade" | "plan_upgrade";
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

      // Use the computed plano object
      const isProfissional = plano?.isProfissionalPlan;

      let result;
      // Se estiver no profissional e quiser ir para essencial -> Downgrade
      if (isProfissional) {
         result = await usuarioApi.downgradePlano({
            usuario_id: profile.id,
            plano_id: planoEssencialId
         });
      } else {
         // Se estiver no gratuito -> Upgrade
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
      console.error("Erro upgrade/downgrade essencial:", error);
      toast.error("Erro ao alterar de plano", {
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

    if (!targetId && !targetPlan?.isCustom) {
      toast.error("Erro de configuração", {
        description: "Plano não disponível no momento.",
      });
      return;
    }

    try {
      setLoading(true);

      // Use the computed plano object for reliable detection
      const isAlreadyProfissional = plano?.isProfissionalPlan;
      
      let result;

      if (isAlreadyProfissional) {
        // --- Fluxo de Troca de Capacidade (Subplano) ---
        
        // Cenario 1: Customizado (Quantidade > tiers padrão)
        if (targetPlan?.isCustom) {
            console.log("Fluxo: Custom (Ja no Profissional)");
             result = await usuarioApi.criarAssinaturaProfissionalPersonalizado({
                usuario_id: profile.id,
                quantidade: targetPlan.quantidade
             });
        } 
        // Cenario 2: Subplano Padrão (6, 8, 10 vagas...)
        else if (targetId) {
            console.log("Fluxo: Trocar Subplano (Ja no Profissional)");
             result = await usuarioApi.trocarSubplano({
                usuario_id: profile.id,
                subplano_id: targetId
            });
        }
      } else {
        // --- Fluxo de Upgrade de Tier (Ex: Essencial -> Profissional) ---
        console.log("Fluxo: Upgrade de Tier (Novo no Profissional)");
        
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
          context: isAlreadyProfissional ? "franchise_upgrade" : "plan_upgrade",
          initialData: {
             qrCodePayload: result.qrCodePayload,
             location: result.location,
             inter_txid: result.inter_txid,
             cobrancaId: String(result.cobrancaId)
          }
        });
      } else {
        await refreshProfile();
        
        // Mensagem direta sem pagamento (ex: valor zero ou fatura futura)
        const title = isAlreadyProfissional ? "Limite aumentado!" : "Plano atualizado!";
        const desc = isAlreadyProfissional 
            ? "Sua franquia de automação foi expandida." 
            : "Bem-vindo ao Plano Profissional.";

        toast.success(title, { description: desc });
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

  const handleClosePayment = (success?: boolean, customMessage?: { title: string, description: string }) => {
    // Captura o contexto antes de limpar o estado
    const context = pagamentoDialog?.context; 
    setPagamentoDialog(null);

    // Fecha nível 2 SOMENTE se houve sucesso explícito OU verificado anteriormente
    if (success === true || isPaymentVerified) {
        if (customMessage) {
            toast.success(customMessage.title, {
                description: customMessage.description,
                duration: 4000
            });
        } else {
            // Mensagens contextuais baseadas no tipo de operação
            if (context === "franchise_upgrade") {
                toast.success("Capacidade Aumentada!", {
                    description: "Seu limite de passageiros no automático foi atualizado.",
                    duration: 4000
                });
            } else if (context === "plan_upgrade") {
                toast.success("Bem-vindo ao Profissional!", {
                    description: "Agora você tem cobrança automática e todos os recursos.",
                    duration: 4000
                });
            } else {
                toast.success("Sucesso!", {
                    description: "Operação realizada com sucesso.",
                    duration: 4000
                });
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
