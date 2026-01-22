import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { assinaturaCobrancaApi } from "@/services/api/assinatura-cobranca.api";
import { AlertTriangle, Lock } from "lucide-react";
import { useState } from "react";

export function GlobalExpiryBanner() {
  const { plano, isReadOnly, isLoading, profile } = usePermissions();
  const { openPlanUpgradeDialog } = useLayout();
  const [loadingPay, setLoadingPay] = useState(false);

  // Flags from Backend Summary
  const flags = profile?.flags;
  const pendingInvoiceId = flags?.ultima_fatura === "PENDENTE_PAGAMENTO" ? flags.ultima_fatura_id : null;
  const isTrialEnding = plano?.isTrial && typeof flags?.dias_restantes_trial === "number" ? flags.dias_restantes_trial <= 3 : false;
  const daysRemaining = flags?.dias_restantes_trial ?? 0;

  const {
    pagamentoDialog,
    setPagamentoDialog,
    handleClosePayment,
    setIsPaymentVerified
  } = usePlanUpgrade();

  // On Demand Fetch to open dialog
  const handlePayPending = async () => {
    if (!pendingInvoiceId) return;
    try {
        setLoadingPay(true);
        const cobranca = await assinaturaCobrancaApi.getAssinaturaCobranca(pendingInvoiceId);
        
        setPagamentoDialog({
            isOpen: true,
            cobrancaId: cobranca.id,
            valor: Number(cobranca.valor),
            nomePlano: plano?.nome || "Assinatura",
            context: "upgrade",
            initialData: {
                qrCodePayload: cobranca.qr_code_payload,
                location: "", 
                inter_txid: "",
                cobrancaId: cobranca.id
            }
        });
    } catch (err) {
        console.error("Erro ao buscar cobranca", err);
    } finally {
        setLoadingPay(false);
    }
  };

  if (isLoading || !plano) return null;

  // 1. Read Only (Expired/Inactive)
  if (isReadOnly) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-md relative z-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {pendingInvoiceId 
                ? "Seu período de teste acabou e sua conta está restrita. Realize o pagamento para liberar o acesso imediatamente."
                : "Seu plano expirou e sua conta está em modo somente leitura. Renove agora para voltar a editar seus dados."
              }
            </p>
        </div>
        <Button 
            variant="secondary" 
            size="sm"
            disabled={loadingPay}
            className="whitespace-nowrap bg-white text-red-600 hover:bg-red-50 border-0"
            onClick={() => pendingInvoiceId ? handlePayPending() : openPlanUpgradeDialog({ feature: "RENEWAL" })}
        >
            {pendingInvoiceId ? (loadingPay ? "Carregando..." : "Ativar Assinatura") : "Renovar Plano"}
        </Button>
        {pagamentoDialog?.isOpen && (
            <PagamentoAssinaturaDialog
            isOpen={pagamentoDialog.isOpen}
            onClose={handleClosePayment}
            cobrancaId={pagamentoDialog.cobrancaId}
            valor={pagamentoDialog.valor}
            nomePlano={pagamentoDialog.nomePlano}
            onPaymentVerified={() => {
                setIsPaymentVerified(true);
                handleClosePayment(true);
            }}
            initialData={pagamentoDialog.initialData}
            />
        )}
      </div>
    );
  }

  // 2. Trial Expiry Warning (<= 3 days)
  if (isTrialEnding) {
       return (
        <div className="bg-yellow-500 text-white px-4 py-3 shadow-md relative z-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                Seu período de teste acaba em <strong>{daysRemaining === 0 ? "hoje" : `${daysRemaining} dias`}</strong>. 
                Garanta a continuidade do seu acesso.
                </p>
            </div>
            <Button 
                variant="secondary" 
                size="sm"
                disabled={loadingPay}
                className="whitespace-nowrap bg-white text-yellow-600 hover:bg-yellow-50 border-0"
                onClick={() => pendingInvoiceId ? handlePayPending() : openPlanUpgradeDialog({ feature: "TRIAL_END" })}
            >
                {pendingInvoiceId ? (loadingPay ? "Carregando..." : "Pagar Agora") : "Assinar Agora"}
            </Button>
            {/* Render Payment Dialog also here if yellow banner active and user fetches payment */}
            {pagamentoDialog?.isOpen && (
                <PagamentoAssinaturaDialog
                isOpen={pagamentoDialog.isOpen}
                onClose={handleClosePayment}
                cobrancaId={pagamentoDialog.cobrancaId}
                valor={pagamentoDialog.valor}
                nomePlano={pagamentoDialog.nomePlano}
                onPaymentVerified={() => {
                    setIsPaymentVerified(true);
                    handleClosePayment(true);
                }}
                initialData={pagamentoDialog.initialData}
                />
            )}
        </div>
       );
  }

  return null;
}
