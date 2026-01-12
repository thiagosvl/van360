import { Button } from "@/components/ui/button";
import { PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { Loader2 } from "lucide-react";

interface FooterActionsProps {
  activeTab: string;
  loading: boolean;
  onUpgradeEssencial: () => void;
  onUpgradeProfissional: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planoEssencialData: any;
  currentTierOption: { quantidade?: number } | null;
  planoAtualSlug?: string;
  salesContext: string;
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
}: FooterActionsProps) {
  return (
    <div className="bg-white p-4 border-t border-gray-100 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-20">
      {activeTab === PLANO_ESSENCIAL ? (
        <Button
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all text-base mb-0"
          onClick={onUpgradeEssencial}
          disabled={loading || !planoEssencialData}
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : planoAtualSlug === PLANO_GRATUITO ? (
            "Teste Grátis por 7 dias"
          ) : (
            "Ativar Essencial"
          )}
        </Button>
      ) : (
        <Button
          className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-100 transition-all text-base mb-0"
          onClick={onUpgradeProfissional}
          disabled={loading || !currentTierOption}
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : salesContext === "expansion" ? (
            `Aumentar franquia`
          ) : salesContext === "upgrade_auto" ? (
            `Contratar agora`
          ) : (
            `Contratar agora`
          )}
        </Button>
      )}
    </div>
  );
}
