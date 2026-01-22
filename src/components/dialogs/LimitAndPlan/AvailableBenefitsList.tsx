import { BenefitItem } from "./BenefitItem";
import { PlanBenefit } from "./planBenefits";

interface AvailableBenefitsListProps {
  benefits: PlanBenefit[];
  showSocialProof?: boolean;
}

export function AvailableBenefitsList({ 
  benefits,
  showSocialProof = false 
}: AvailableBenefitsListProps) {
  if (benefits.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header com Prova Social (Opcional) */}
      {showSocialProof && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">⭐</span>
            <p className="text-sm font-bold text-gray-900">
              Recursos mais valorizados
            </p>
          </div>
          <p className="text-xs text-gray-600">
            <strong>+500 motoristas</strong> economizam 15+ horas por mês com automação
          </p>
        </div>
      )}

      {/* Lista de Benefícios */}
      <div className="space-y-6">
        {benefits.map((benefit, index) => (
          <BenefitItem
            key={index}
            text={benefit.text}
            description={benefit.description}
            included={true}
          />
        ))}
      </div>
    </div>
  );
}
