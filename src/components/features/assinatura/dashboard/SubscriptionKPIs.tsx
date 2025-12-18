import { BlurredValue } from "@/components/common/BlurredValue";
import { KPICard } from "@/components/common/KPICard";
import { LimitHealthBar } from "@/components/common/LimitHealthBar";
import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { Bot, Timer, TrendingUp, Users } from "lucide-react";

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
  const { openPlanUpgradeDialog } = useLayout();
  const slug = plano?.slug;
  const isFree = slug === PLANO_GRATUITO;
  const isEssential = slug === PLANO_ESSENCIAL;
  const isComplete =
    slug === PLANO_COMPLETO || plano?.parent?.slug === PLANO_COMPLETO;

  // Renderiza componente de passageiros ativos (Reutilizado no Essencial e Completo)
  const renderPassengerCard = (variant: 'success' | 'info') => (
      <KPICard
        title="Passageiros Ativos"
        value={metricas.passageirosAtivos}
        icon={Users}
        colorClass={variant === 'success' ? "text-green-600" : "text-blue-600"}
        bgClass={variant === 'success' ? "bg-green-50" : "bg-blue-50"}
        countVisible={true}
        format="number"
      />
  );

  // Helper para renderizar o card de Tempo Economizado (Reutilizado no Grátis e Completo)
  const renderTimeSavedCard = (restricted: boolean) => {
    // Simulação de ROI para o completo (ou valor fixo para blur no free)
    const envios = metricas.cobrancasEmUso || 0;
    const tempoEconomizadoHoras = Math.round((envios * 5) / 60);

    return (
      <KPICard
        title="Tempo Economizado"
        value={
          restricted ? (
            <BlurredValue value={12} visible={false} type="number" />
          ) : (
            `${tempoEconomizadoHoras}h`
          )
        }
        icon={Timer}
        colorClass="text-green-600"
        bgClass="bg-green-50"
        countText={
          restricted ? (
            <span className="text-primary font-medium text-xs"></span>
          ) : (
            "Com automação este mês"
          )
        }
        countVisible={true}
        restricted={restricted}
        onClick={() =>
          restricted &&
          openPlanUpgradeDialog({
            feature: "automacao",
            defaultTab: PLANO_COMPLETO,
          })
        }
      />
    );
  };

  // KPIs para Plano Gratuito (Foco em FOMO/Limite)
  if (isFree) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Limite de Passageiros (Componente Reutilizado) */}
        <div className="h-full">
          <LimitHealthBar
            label="Passageiros Ativos"
            current={metricas.passageirosAtivos}
            max={metricas.limitePassageiros || 5} // Fallback seguro
            description={
              metricas.passageirosAtivos >= metricas.limitePassageiros
                ? "Limite atingido."
                : `${Math.max(
                    0,
                    metricas.limitePassageiros - metricas.passageirosAtivos
                  )} ${
                    metricas.limitePassageiros - metricas.passageirosAtivos ===
                    1
                      ? "vaga restante"
                      : "vagas restantes"
                  }.`
            }
            onIncreaseLimit={() =>
              openPlanUpgradeDialog({
                feature: "passageiros",
                defaultTab: PLANO_ESSENCIAL,
                targetPassengerCount: metricas.passageirosAtivos,
              })
            }
            className="h-full mb-0 bg-white shadow-sm border-red-100 flex flex-col justify-center"
            variant="full"
          />
        </div>

        {/* KPI 2: Passageiros no Automático (Blocked) */}
        <KPICard
          title="Passageiros no Automático"
          value={<BlurredValue value={15} visible={false} type="number" />}
          icon={Bot}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
          countLabel="ativos"
          countVisible={true}
          countText={
            <span className="text-primary font-medium text-xs"></span>
          }
          className="border-purple-100 opacity-90 cursor-pointer hover:opacity-100 transition-opacity"
          restricted={true}
          onClick={() =>
            openPlanUpgradeDialog({
              feature: "automacao",
              defaultTab: PLANO_COMPLETO,
            })
          }
        />

        {/* KPI 3: Tempo Economizado (Blocked/Reutilizado) */}
        {renderTimeSavedCard(true)}
      </div>
    );
  }

  // KPIs para Plano Essencial (Foco em Dor Manual vs Automação)
  if (isEssential) {
    // Simulação: Se ele tem X passageiros, cobrando manual gasta ~5min por passageiro.
    const tempoGastoMinutos = metricas.passageirosAtivos * 5;
    const tempoGastoHoras = Math.round((tempoGastoMinutos / 60) * 10) / 10;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Sucesso (Passageiros) */}
        {renderPassengerCard('success')}

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
          onClick={() => openPlanUpgradeDialog({ feature: "automacao" })}
        >
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <TrendingUp className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wide mb-1">
            Potencial com Automação
          </h3>
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Passageiros Ativos */}
        {renderPassengerCard('info')}

        {/* 2. Uso da Franquia (Health Bar) */}
        {/* Usamos o componente genérico LimitHealthBar para manter consistência visual */}
        <div className="h-full">
          <LimitHealthBar
            current={metricas.cobrancasEmUso}
            max={metricas.franquiaContratada}
            label="Cobrança Automática"
            description={`Você ainda tem ${Math.max(
              0,
              metricas.franquiaContratada - metricas.cobrancasEmUso
            )} automações disponíveis.`}
            className="h-full mb-0 border-0 shadow-md bg-white border-purple-100" // Ajuste de estilo para combinar com os cards
            onIncreaseLimit={() =>
              openPlanUpgradeDialog({
                feature: "automacao",
                defaultTab: PLANO_COMPLETO,
              })
            }
          />
        </div>

        {/* 3. Tempo Economizado (Reutilizado) */}
        {renderTimeSavedCard(false)}
      </div>
    );
  }

  return null;
}
