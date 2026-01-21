import { Button } from "@/components/ui/button";
import { PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
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
}: FooterActionsProps) {
  return (
    <div className="shrink-0 z-20 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] bg-white">
      {activeTab === PLANO_ESSENCIAL && planoAtualSlug === PLANO_GRATUITO && (
        <div className="bg-emerald-100 py-2.5 px-4 text-center border-b border-emerald-100/50">
          <span className="text-sm font-semibold text-gray-800">
            Experimente por {trialDays} dias grátis
          </span>
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
            disabled={loading || !currentTierOption || (currentPrice === null && !isLoadingPrice) || isLoadingPrice}
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
