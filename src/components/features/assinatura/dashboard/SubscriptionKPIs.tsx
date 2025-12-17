import { BlurredValue } from "@/components/common/BlurredValue";
import { KPICard } from "@/components/common/KPICard";
import { PassengerLimitHealthBar } from "@/components/features/passageiro/PassengerLimitHealthBar";
import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { Timer, TrendingUp, Users } from "lucide-react";

interface SubscriptionKPIsProps {
  plano: any;
  metricas: {
    passageirosAtivos: number;
    limitePassageiros: number | null;
    cobrancasEmUso: number;
    franquiaContratada: number;
  };
}

export function SubscriptionKPIs({ plano, metricas }: SubscriptionKPIsProps) {
  const { openContextualUpsellDialog } = useLayout();
  const slug = plano?.slug;
  const isFree = slug === PLANO_GRATUITO;
  const isEssential = slug === PLANO_ESSENCIAL;
  const isComplete = slug === PLANO_COMPLETO || plano?.parent?.slug === PLANO_COMPLETO;

  // KPIs para Plano Gratuito (Foco em FOMO/Limite)
  if (isFree) {
    return (
      <div className="space-y-4">
        {/* KPI 1: Limite de Passageiros (Componente Reutilizado) */}
        <PassengerLimitHealthBar 
           current={metricas.passageirosAtivos}
           max={metricas.limitePassageiros || 5} // Fallback seguro
           onIncreaseLimit={() => openContextualUpsellDialog({ feature: "passageiros" })}
           className="mb-0 bg-white shadow-sm border-red-100"
           variant="full"
           description={metricas.passageirosAtivos >= (metricas.limitePassageiros || 5) ? "Você atingiu o limite do plano grátis." : undefined}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KPI 2: Receita Bloqueada (Upsell) */}
            <KPICard 
                 title="Receita Estimada"
                 value={<BlurredValue value={3500} visible={false} type="currency" />}
                 icon={TrendingUp}
                 colorClass="text-orange-600"
                 bgClass="bg-orange-50"
                 countLabel="mensal"
                 countVisible={true}
                 countText={<span className="text-orange-600 font-medium text-xs">Desbloqueie para ver</span>}
                 className="border-orange-100 opacity-90"
                 restricted={true} 
                 onClick={() => openContextualUpsellDialog({ feature: "financeiro" })}
            />

            {/* KPI 3: Automação (Upsell) */}
            <KPICard 
                 title="Tempo Economizado"
                 value={<BlurredValue value={12} visible={false} type="number" />}
                 icon={Timer}
                 colorClass="text-blue-600"
                 bgClass="bg-blue-50"
                 countText={<span className="text-blue-600 font-medium text-xs">Com automação</span>}
                 countVisible={true}
                 restricted={true}
                 onClick={() => openContextualUpsellDialog({ feature: "automacao" })}
            />
        </div>
      </div>
    );
  }

  // KPIs para Plano Essencial (Foco em Dor Manual vs Automação)
  if (isEssential) {
    // Simulação: Se ele tem X passageiros, cobrando manual gasta ~5min por passageiro.
    const tempoGastoMinutos = metricas.passageirosAtivos * 5; 
    const tempoGastoHoras = Math.round(tempoGastoMinutos / 60 * 10) / 10;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Sucesso (Passageiros) */}
        <KPICard 
             title="Passageiros Ativos"
             value={metricas.passageirosAtivos}
             icon={Users}
             colorClass="text-green-600"
             bgClass="bg-green-50"
             countVisible={true}
        />

        {/* KPI 2: Dor (Tempo Gasto) */}
        <KPICard 
             title="Tempo Gasto (Cobrança)"
             value={`${tempoGastoHoras}h`}
             icon={Timer}
             colorClass="text-orange-600"
             bgClass="bg-orange-50"
             countText="Manual este mês"
             countVisible={true}
        />

        {/* KPI 3: Solução (Automação) */}
        <div 
            className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl text-white shadow-lg cursor-pointer transform transition-transform hover:-translate-y-1 relative overflow-hidden"
            onClick={() => openContextualUpsellDialog({ feature: "automacao" })}
        >
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <TrendingUp className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wide mb-1">Potencial com Automação</h3>
            <div className="text-2xl font-bold mb-1">0 min</div>
            <p className="text-blue-100 text-xs text-opacity-90">
                Seria seu tempo gasto com o Plano Completo.
            </p>
            <div className="mt-3 inline-block bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                Fazer Upgrade
            </div>
        </div>
      </div>
    );
  }

  // KPIs para Plano Completo (Foco em Sucesso/ROI)
  if (isComplete) {
    // Simulação de ROI
    const envios = metricas.cobrancasEmUso || 0;
    const tempoEconomizadoHoras = Math.round((envios * 5) / 60); // 5 min saved per automation
    const receitaGerida = envios * 350; // Ticket médio R$ 350

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
            title="Passageiros Ativos"
            value={metricas.passageirosAtivos}
            icon={Users}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            countVisible={true}
            format="number"
        />

        <KPICard 
             title="Tempo Economizado"
             value={`${tempoEconomizadoHoras}h`}
             icon={Timer}
             colorClass="text-green-600"
             bgClass="bg-green-50"
             countText="Com automação este mês"
             countVisible={true}
        />

        <KPICard 
             title="Receita Automática"
             value={receitaGerida}
             icon={TrendingUp}
             colorClass="text-purple-600"
             bgClass="bg-purple-50"
             countText="Gerida no piloto automático"
             countVisible={true}
        />
      </div>
    );
  }

  return null;
}
