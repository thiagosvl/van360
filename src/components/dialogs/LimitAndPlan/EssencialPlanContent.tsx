import { PLANO_PROFISSIONAL } from "@/constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { ChevronRight, Sparkles, Zap } from "lucide-react";
import { BenefitItem } from "./BenefitItem";

interface EssencialPlanContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planoEssencialData: any;
  setIsBenefitsOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export function EssencialPlanContent({
  planoEssencialData,
  setIsBenefitsOpen,
  setActiveTab,
}: EssencialPlanContentProps) {
  return (
    <div className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none">
      {/* 1. Hero Price (Standardized) */}
      <div className="text-center py-2 space-y-1">
        <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3" />
          Grátis por 7 dias
        </div>
        <div className="flex flex-col items-center">
          {planoEssencialData?.promocao_ativa &&
            planoEssencialData?.preco_promocional && (
              <span className="text-sm text-gray-400 line-through font-medium mb-[-4px]">
                De {formatCurrency(Number(planoEssencialData.preco))}
              </span>
            )}
          <div className="flex items-baseline justify-center gap-1.5 text-gray-900">
            <span className="text-4xl font-extrabold tracking-tight">
              {planoEssencialData
                ? formatCurrency(
                    Number(
                      planoEssencialData.promocao_ativa
                        ? planoEssencialData.preco_promocional
                        : planoEssencialData.preco
                    )
                  )
                : "R$ --"}
            </span>
            <span className="text-lg font-medium text-gray-400">/mês</span>
          </div>
        </div>
      </div>

      {/* 2. Benefits List (Standardized) */}
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <BenefitItem text="Passageiros Ilimitados" />
          <BenefitItem text="Organização Básica" />
          <BenefitItem text="Suporte Prioritário" />
          <BenefitItem text="Cobrança Automática (Zap)" included={false} />
        </div>
      </div>

      {/* Botão Ver Mais Benefícios */}
      <button
        onClick={() => setIsBenefitsOpen(true)}
        className="w-full text-center text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 py-2 mt-2"
      >
        Ver todos recursos
        <ChevronRight className="w-3 h-3" />
      </button>

      {/* 3. Upsell Trigger (Banner Button) */}
      <button
        onClick={() => setActiveTab(PLANO_PROFISSIONAL)}
        className="mt-6 w-full group relative overflow-hidden bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-300 rounded-xl p-4 transition-all duration-300 text-left"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 group-hover:bg-white flex items-center justify-center text-violet-600 transition-colors shadow-sm">
              <Zap className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-violet-900 leading-tight">
                Quer automatizar tudo?
              </p>
              <p className="text-xs text-violet-600/80 leading-tight mt-0.5 font-medium">
                Veja o Plano Profissional
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400 group-hover:text-violet-700 transition-colors transform group-hover:translate-x-1" />
        </div>
      </button>

      {/* Espaçador */}
      <div className="h-4 sm:h-0" />
    </div>
  );
}
