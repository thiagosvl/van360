import { PLANO_PROFISSIONAL } from "@/constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

interface UpsellBannerProps {
  currentPrice: number;
  upgradePrice: number;
  onUpgrade: () => void;
  isInTrial?: boolean;
}

export function UpsellBanner({
  currentPrice,
  upgradePrice,
  onUpgrade,
  isInTrial = false,
}: UpsellBannerProps) {
  const priceDifference = upgradePrice - currentPrice;

  return (
    <button
      onClick={onUpgrade}
      className="w-full group relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-2 border-violet-200 hover:border-violet-300 rounded-2xl p-5 sm:p-5 transition-all duration-300 text-left shadow-sm hover:shadow-lg active:scale-[0.98]"
    >
      {/* Badge "Mais Escolhido" - Mobile First */}
      <div className="absolute -top-1 -right-1 bg-violet-600 text-white text-[11px] sm:text-[10px] font-bold px-3.5 sm:px-3 py-1.5 sm:py-1 rounded-bl-xl rounded-tr-xl shadow-md flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
        <span>Mais Escolhido</span>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header - Mobile First */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-4 sm:h-4 text-white fill-white" />
            </div>
            <h4 className="text-[17px] sm:text-base font-bold text-gray-900">
              Plano Profissional
            </h4>
          </div>

          {/* Descrição - Mobile First */}
          <p className="text-[14px] sm:text-sm text-gray-700 leading-relaxed mb-4">
            {isInTrial
              ? "Automatize cobranças, reduza inadimplência em 80% e recupere 15+ horas por mês."
              : "Pare de cobrar manualmente. Deixe o robô fazer isso por você."}
          </p>

          {/* Preço - Mobile First (maior destaque) */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[13px] sm:text-xs text-gray-500 font-medium">
              Por apenas
            </span>
            <span className="text-3xl sm:text-2xl font-bold text-violet-600">
              +{formatCurrency(priceDifference)}
            </span>
            <span className="text-[13px] sm:text-xs text-gray-500 font-medium">/mês</span>
          </div>

          {/* CTA - Mobile First */}
          <div className="flex items-center gap-2 text-[15px] sm:text-sm font-semibold text-violet-600 group-hover:text-violet-700 transition-colors">
            <span>Ver detalhes do Profissional</span>
            <ArrowRight className="w-4.5 h-4.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Prova Social - Mobile First */}
      <div className="mt-5 sm:mt-4 pt-4 border-t border-violet-200/50">
        <p className="text-[13px] sm:text-xs text-gray-600 font-medium">
          ⭐ <strong>70% dos motoristas</strong> escolhem o Profissional
        </p>
      </div>
    </button>
  );
}
