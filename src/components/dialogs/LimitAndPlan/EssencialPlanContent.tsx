import { PLANO_PROFISSIONAL } from "@/constants";
import { Zap } from "lucide-react";
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
    <div className="p-6 space-y-8 m-0 focus-visible:ring-0 outline-none">
      {/* 2. Benefits List (Standardized) */}
      <div className="space-y-6">
        <BenefitItem
          text="Sem limite de passageiros"
          description="Cadastre quantos alunos precisar, sem restrições."
        />
        <BenefitItem
          text="Organização Completa"
          description="Tenha controle total da sua gestão escolar e financeira."
        />
        <BenefitItem
          text="Suporte via WhatsApp"
          description="Tire suas dúvidas diretamente com nosso time de especialistas."
        />
        <BenefitItem
          text="Cobrança Automática"
          description="Disponível apenas no plano Profissional."
          included={false}
        />
      </div>

      {/* 3. Upsell Trigger (Banner Button) - Clean Style */}
      <button
        onClick={() => setActiveTab(PLANO_PROFISSIONAL)}
        className="w-full group relative overflow-hidden bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-2xl p-4 transition-all duration-300 text-left"
      >
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-900 leading-tight mb-1">
              Quer automatizar tudo?
            </p>
            <p className="text-xs text-violet-600/80 font-medium">
              Conheça o Plano Profissional <span aria-hidden="true">&rarr;</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-violet-600 transition-colors">
             <Zap className="w-5 h-5 fill-current" />
          </div>
        </div>
      </button>



      {/* Espaçador */}
      <div className="h-4 sm:h-0" />
    </div>
  );
}
