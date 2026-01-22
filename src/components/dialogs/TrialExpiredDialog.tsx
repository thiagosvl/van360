import { PlanoCard } from "@/components/features/register/PlanoCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";
import { usePlanos } from "@/hooks/api/usePlanos";
import { usePlanUpgrade } from "@/hooks/business/usePlanUpgrade";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

export interface TrialExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrialExpiredDialog({ open, onOpenChange }: TrialExpiredDialogProps) {
  const { data: planosData } = usePlanos({ ativo: "true" }) as any;
  const planos = [...(planosData?.bases || []), ...(planosData?.sub || [])];

  const planoEssencialData = planos.find((p: any) => p.slug === PLANO_ESSENCIAL);
  const planoProfissionalData = planos.find((p: any) => p.slug === PLANO_PROFISSIONAL);

  const {
    pagamentoDialog,
    setIsPaymentVerified,
    handleUpgradeEssencial,
    handleUpgradeProfissional,
    handleClosePayment,
  } = usePlanUpgrade({
    onSuccess: () => onOpenChange(false),
  });

  const handleSelectPlan = (slug: string) => {
    if (slug === PLANO_ESSENCIAL) {
        handleUpgradeEssencial(planoEssencialData?.id);
    } else if (slug === PLANO_PROFISSIONAL) {
        handleUpgradeProfissional(planoProfissionalData?.id);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="text-center p-6 bg-red-50 rounded-t-lg -mx-6 -mt-6 mb-6">
            <h2 className="text-2xl font-bold text-red-700">Seu período de teste expirou!</h2>
            <p className="text-red-600 mt-2">Escolha um plano para destravar seu acesso e continuar operando.</p>
          </div>

          {/* Opções de Plano */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-2 md:p-6 items-start">
            {planoEssencialData && (
                <div className="transform scale-95 hover:scale-100 transition-transform">
                     <PlanoCard 
                        plano={planoEssencialData} 
                        periodo={"mensal"}
                        onSelect={() => handleSelectPlan(PLANO_ESSENCIAL)} 
                        buttonText="Assinar Essencial"
                        highlight={false}
                    />
                </div>
            )}
            {planoProfissionalData && (
                 <div className="transform scale-95 hover:scale-100 transition-transform">
                    <PlanoCard 
                        plano={planoProfissionalData} 
                        periodo={"mensal"}
                        onSelect={() => handleSelectPlan(PLANO_PROFISSIONAL)} 
                        buttonText="Assinar Profissional"
                        highlight={true}
                    />
                 </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center p-4 text-sm text-gray-500 mt-auto">
            <p>Você ainda pode visualizar seus dados (somente leitura) por 30 dias.</p>
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
