import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanUpgrade } from "@/hooks/ui/usePlanUpgrade";
import { cn } from "@/lib/utils";
import { AssinaturaCobrancaStatus } from "@/types/enums";
import { Lock } from "lucide-react";

export function GlobalExpiryBanner() {
  const { plano, is_read_only, isLoading, profile } = usePermissions();
  const { 
    openSubscriptionExpiredDialog, 
    isSubscriptionExpiredDialogOpen, 
    isPlanUpgradeDialogOpen 
  } = useLayout();

  // Flags from Backend Summary
  const flags = profile?.flags;
  const pendingInvoiceId = flags?.ultima_fatura === AssinaturaCobrancaStatus.PENDENTE_PAGAMENTO ? flags.ultima_fatura_id : null;

  const {
    pagamentoDialog,
    handleClosePayment,
    setIsPaymentVerified
  } = usePlanUpgrade();

  // Centralized action: always open the refined dialog
  const handleAction = () => {
    openSubscriptionExpiredDialog();
  };

  if (isLoading || !plano) return null;

  // Ocultar banner se algum dialog importante estiver aberto para evitar sobreposição
  const isAnyDialogOpen = isSubscriptionExpiredDialogOpen || isPlanUpgradeDialogOpen || pagamentoDialog?.isOpen;

  // 1. Read Only (Expired/Inactive)
  if (is_read_only && !isAnyDialogOpen) {
    return (
      <>
        {/* Anti-occlusion Logic for Layout elements */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --banner-height: 0px; }
          @media (max-width: 639px) { :root { --banner-height: 80px; } }
          @media (min-width: 640px) { :root { --banner-height: 50px; } }
          
          /* Push Navbar down on Desktop only if banner is top-fixed */
          @media (min-width: 640px) {
            header.fixed { top: var(--banner-height) !important; }
            aside.fixed { top: var(--banner-height) !important; height: calc(100vh - var(--banner-height)) !important; }
            main { padding-top: calc(5.5rem + var(--banner-height)) !important; }
          }

          /* Push Main content UP on Mobile to not hide things behind bottom banner */
          @media (max-width: 639px) {
            main { padding-bottom: calc(2.5rem + var(--banner-height)) !important; }
          }
        `}} />
        
        <div className={cn(
            "fixed left-0 right-0 z-40 px-4 py-2 shadow-2xl flex items-center justify-between gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2",
            "bg-red-600 text-white",
            // Mobile: Bottom (Simple bar) | Desktop: Top (Full Width)
            "bottom-0 top-auto sm:top-0 sm:bottom-auto", 
            "border-t border-red-500 sm:border-t-0 sm:border-b"
        )}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="hidden sm:flex h-7 w-7 bg-white/20 rounded-lg items-center justify-center flex-shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="text-left overflow-hidden">
                    <p className="text-sm font-bold leading-tight truncate sm:whitespace-normal">
                      Bloqueado: {pendingInvoiceId ? "Pagamento Pendente" : "Plano Expirado"}
                    </p>
                    <p className="text-[10px] opacity-90 leading-tight hidden xs:block">
                      {pendingInvoiceId 
                          ? "Assinatura pausada. Regularize para liberar o acesso."
                          : "Volte a editar seus dados ativando um plano agora."
                      }
                    </p>
                </div>
            </div>
            
            <Button 
                variant="secondary" 
                size="sm"
                className="whitespace-nowrap bg-white text-red-600 hover:bg-red-50 border-0 font-extrabold h-8 px-4 rounded-lg shadow-sm active:scale-95 transition-transform text-xs"
                onClick={handleAction}
            >
                {pendingInvoiceId ? "Regularizar" : "Renovar"}
            </Button>
            
            {pagamentoDialog?.isOpen && (
                <PagamentoAssinaturaDialog
                  isOpen={pagamentoDialog.isOpen}
                  onClose={() => handleClosePayment()}
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
      </>
    );
  }

  return null;
}
