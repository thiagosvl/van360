import { Button } from "@/components/ui/button";
import { PLANO_ESSENCIAL } from "@/constants";
import { getMessage } from "@/constants/messages";
import { formatCurrency } from "@/utils/formatters/currency";
import { Loader2 } from "lucide-react";

interface FooterActionsProps {
  activeTab: string;
  loading: boolean;
  onUpgradeEssencial: () => void;
  onUpgradeProfissional: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planoEssencialData: any;
  currentTierOption: { quantidade?: number | string } | null;
  planoAtualSlug?: string;
  salesContext: string;
  // New props for price display
  currentPrice: number | null;
  originalPrice?: number | null;
  trialDays?: number;
  isLoadingPrice?: boolean;

  // Safety lock props
  isFranchiseInsufficient?: boolean;
  automatedCount?: number;
}

export function FooterActions({
  activeTab,
  loading,
  onUpgradeEssencial,
  onUpgradeProfissional,
  planoEssencialData,
  currentTierOption,
  planoAtualSlug,
  salesContext,
  currentPrice,
  trialDays = 7, // Default fallback
  isLoadingPrice = false,
  isFranchiseInsufficient = false,
  automatedCount = 0,
}: FooterActionsProps) {
  return (
    <div className="shrink-0 z-20 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] bg-white">
      {activeTab === PLANO_ESSENCIAL && (
        <div className="bg-emerald-100 py-2.5 px-4 text-center border-b border-emerald-100/50">
          <span className="text-sm font-semibold text-gray-800">
            Experimente por {trialDays} dias grátis
          </span>
        </div>
      )}

      {isFranchiseInsufficient && activeTab !== PLANO_ESSENCIAL && (
        <div className="bg-amber-50 py-3 px-6 border-b border-amber-100 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
             <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                <span className="text-amber-600">⚠️</span>
             </div>
             <div className="flex-1">
                <p className="text-xs font-bold text-amber-900 leading-tight">
                  {getMessage("assinatura.erro.franquiaInsuficiente")}
                </p>
                <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
                  {getMessage("assinatura.erro.franquiaInsuficienteDescricao", {
                    ATIVOS: automatedCount,
                    NOVA: String(currentTierOption?.quantidade || 0),
                    EXCEDENTE: automatedCount - Number(currentTierOption?.quantidade || 0)
                  })}
                </p>
             </div>
          </div>
        </div>
      )}

      <div className="p-4 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500 font-normal">
            Valor mensal
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base text-gray-900 font-bold">R$</span>
            <span className="text-2xl font-semibold text-gray-900 tracking-tighter leading-none">
            {isLoadingPrice || currentPrice === null ? (
              "--"
            ) : (
              formatCurrency(currentPrice).replace("R$", "").trim()
            )}
            </span>
          </div>
        </div>

        {activeTab === PLANO_ESSENCIAL ? (
          <Button
            className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-200/50 transition-all text-sm mb-0"
            onClick={onUpgradeEssencial}
            disabled={loading || !planoEssencialData}
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Continuar"
            )}
          </Button>
        ) : (
          <Button
            className="h-12 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md shadow-violet-200/50 transition-all text-sm mb-0 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onUpgradeProfissional}
            disabled={loading || !currentTierOption || (currentPrice === null && !isLoadingPrice) || isLoadingPrice || isFranchiseInsufficient}
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : isLoadingPrice ? (
               <div className="flex items-center gap-2">
                 <Loader2 className="animate-spin w-4 h-4" />
                 <span>Calculando...</span>
               </div>
            ) : salesContext === "expansion" ? (
              "Continuar"
            ) : (
              "Continuar"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
