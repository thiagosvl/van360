import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { CalendarX, ShieldAlert, Sparkles } from "lucide-react";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

export interface SubscriptionExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Poderíamos passar o plano expirado, mas vamos pegar do profile/assinatura
}

export function SubscriptionExpiredDialog({ open, onOpenChange }: SubscriptionExpiredDialogProps) {
  const { user } = useSession();
  const { profile, plano } = useProfile(user?.id);
  const { openPlanUpgradeDialog } = useLayout();

  const {
    pagamentoDialog,
    setIsPaymentVerified,
    handleUpgradeEssencial, // Usado como "Renovar" genérico se mapear ID
    handleUpgradeProfissional,
    handleClosePayment,
  } = usePlanUpgrade({
    onSuccess: () => onOpenChange(false),
  });

  const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
  const planoNome = plano?.nome || "Plano";
  const valor = assinatura?.preco_aplicado || assinatura?.valor || 0;

  const handleRenew = () => {
      // Re-trigger upgrade logic for CURRENT plan to generate new charge
      // Precisamos saber qual era o plano.
      // Se era Essencial: handleUpgradeEssencial(plano.id)
      // Se era Profissional: handleUpgradeProfissional(plano.id)
      
      if (plano?.is_essencial) {
           handleUpgradeEssencial(plano.id);
      } else if (plano?.is_profissional) {
           handleUpgradeProfissional(plano.id);
      } else {
           // Fallback, talvez abrir tela de planos?
           // Por enquanto, assumir essencial
           handleUpgradeEssencial(); 
      }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="text-center p-8 space-y-6">
          <div className="flex justify-center mb-4">
               <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                    <CalendarX className="h-8 w-8 text-red-600" />
               </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Sua assinatura expirou!</h2>
            <p className="text-gray-500">Renove agora para recuperar o acesso total e continuar operando o Van360.</p>
          </div>
          
          {/* Resumo do Plano */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="font-medium text-gray-600 mb-1">Último Plano Contratado</p>
            <p className="text-xl font-bold text-gray-900">{planoNome}</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-2">
                R$ {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                <span className="text-sm font-medium text-gray-400">/mês</span>
            </p>
          </div>

          <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={handleRenew}>
            Renovar Assinatura Agora
          </Button>

          {/* Upsell para Profissional se for Essencial */}
          {plano?.slug === PLANO_ESSENCIAL && (
            <button
              onClick={() => {
                onOpenChange(false);
                openPlanUpgradeDialog({
                  defaultTab: PLANO_PROFISSIONAL,
                  feature: "upgrade_auto",
                });
              }}
              className="w-full text-center py-3 px-4 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors group"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700 group-hover:text-violet-800">
                  Ou faça upgrade para o Profissional
                </span>
              </div>
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-2">
             <ShieldAlert className="w-4 h-4" />
             <p>Seus dados permanecem seguros por 90 dias.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {pagamentoDialog?.isOpen && (
        <PagamentoAssinaturaDialog
          isOpen={pagamentoDialog.isOpen}
          onClose={handleClosePayment}
          cobrancaId={pagamentoDialog.cobrancaId}
          valor={pagamentoDialog.valor}
          nomePlano={pagamentoDialog.nomePlano}
          onPaymentVerified={() => {
             setIsPaymentVerified(true);
             handleClosePayment();
             onOpenChange(false);
          }}
          initialData={pagamentoDialog.initialData}
        />
    )}
    </>
  );
}
