import { KPICard } from "@/components/common/KPICard";
import { LimitHealthBar } from "@/components/common/LimitHealthBar";
import {
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
  PLANO_PROFISSIONAL,
} from "@/constants";
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
  const isProfissional =
    slug === PLANO_PROFISSIONAL || plano?.parent?.slug === PLANO_PROFISSIONAL;

  // Renderiza componente de passageiros ativos (Reutilizado EM TODOS)
  const renderPassengerCard = (variant: "success" | "info" | "default") => {
    // Para plano gratuito, usar LimitHealthBar mas sem a estilização exagerada
    if (isFree && metricas.limitePassageiros !== null) {
      return (
        <div className="h-full">
          <LimitHealthBar
            label="Passageiros Ativos"
            current={metricas.passageirosAtivos}
            max={metricas.limitePassageiros}
            description={
              metricas.passageirosAtivos >= metricas.limitePassageiros
                ? "Limite atingido."
                : `${
                    metricas.limitePassageiros - metricas.passageirosAtivos
                  } vagas restantes.`
            }
            onIncreaseLimit={() =>
              openPlanUpgradeDialog({
                feature: "passageiros",
                defaultTab: PLANO_ESSENCIAL,
                targetPassengerCount: metricas.passageirosAtivos,
              })
            }
            className="h-full mb-0 bg-white shadow-sm border-gray-100 flex flex-col justify-center"
            // Remover estilos de borda colorida/opacidade se houver
          />
        </div>
      );
    }

    return (
      <KPICard
        title="Passageiros Ativos"
        value={metricas.passageirosAtivos}
        icon={Users}
        colorClass={variant === "success" ? "text-green-600" : "text-blue-600"}
        bgClass={variant === "success" ? "bg-green-50" : "bg-blue-50"}
        countVisible={true}
        format="number"
      />
    );
  };

  // 3. Card de Automação (Unificado: Sales vs Real)
  const renderAutomationCard = () => {
    if (isProfissional) {
        return (
          <div className="h-full">
            <LimitHealthBar
              current={metricas.cobrancasEmUso}
              max={metricas.franquiaContratada}
              label="Passageiros no Automático"
              description={
                metricas.cobrancasEmUso >= metricas.franquiaContratada
                  ? "Limite atingido."
                  : `${metricas.franquiaContratada - metricas.cobrancasEmUso} vagas restantes.`
              }
              className="h-full mb-0 border-0 shadow-md bg-white border-purple-100"
              onIncreaseLimit={() =>
                openPlanUpgradeDialog({
                  feature: "automacao",
                  defaultTab: PLANO_PROFISSIONAL,
                  targetPassengerCount: metricas.franquiaContratada + 1,
                })
              }
            />
          </div>
        );
    }

    // Para Gratuito e Essencial: Card de Venda "Cobranças Automáticas"
    // Premium & "Chamativo" Polish
    
    // Cálculo de estimativa de economia (simulado base 5min/passageiro)
    const passageiros = Math.max(0, metricas.passageirosAtivos || 0);
    const horasEstimadas = Math.max(1, Math.ceil((passageiros * 5) / 60)); 

    return (
        <div 
          className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-full flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
          onClick={() =>
            openPlanUpgradeDialog({
              feature: "automacao",
              defaultTab: PLANO_PROFISSIONAL,
              targetPassengerCount: metricas.passageirosAtivos,
            })
          }
        >
            {/* Background Decorativo Sutil (Optional, good for 'chamativo') */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="flex justify-between items-center mb-3 relative z-10">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    Cobranças Automáticas
                </p>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                     <Bot className="w-4 h-4" />
                </div>
            </div>

            {/* Conteúdo Central */}
            <div className="flex-1 flex flex-col justify-center mb-2 relative z-10">
                 <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                    Ativar Piloto Automático
                 </h4>
                 <p className="text-xs text-gray-500 leading-relaxed">
                    Deixe o sistema cobrar e enviar avisos por você.
                 </p>
            </div>

            {/* Footer */}
            <div className="flex flex-row justify-between items-end gap-0 text-left border-t border-gray-100 pt-3 mt-auto relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                        Economia Estimada
                    </span>
                    <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                        {horasEstimadas}h/mês <TrendingUp className="w-3 h-3" />
                    </span>
                </div>
                
                <button
                    className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm group-hover:shadow-blue-200"
                >
                    Ativar 
                </button>
            </div>
        </div>
    );
  };

  // 4. Card de Tempo (Unificado: Real ou Simulado/Venda)
  const renderTimeCard = () => {
    // Cálculo: Baseado em 5 min por passageiro (manual) vs 0 (automático)
    // Se plano profissional: Mostra tempo economizado real (baseado em envios de cobrança)
    // Se outros planos: Mostra tempo que SERIA economizado (baseado em passageiros ativos)

    let titulo = "Tempo Economizado";
    let valor = "0h";
    let descricao = "Com automação este mês";
    let isSimulated = !isProfissional;

    if (isProfissional) {
      const envios = Math.max(0, metricas.cobrancasEmUso || 0);
      const horas = Math.ceil((envios * 5) / 60); // Arredondar para cima
      valor = `${horas}h`;
    } else {
      // Simulação
      const passageiros = Math.max(0, metricas.passageirosAtivos || 0);
      const horas = Math.ceil(((passageiros * 5) / 60)); // Arredondar para cima, remover decimais
      // Garantir pelo menos 1h se houver passageiros para não ficar "0h"
      const horasFinal = passageiros > 0 && horas === 0 ? 1 : horas;
      
      valor = `~${horasFinal}h`;
      descricao = "Quanto tempo gastou cobrando os pais somente este mês";
      titulo = "Tempo Gasto com cobranças";
    }

    return (
      <KPICard
        title={titulo}
        value={valor}
        icon={Timer}
        colorClass={isSimulated ? "text-orange-600" : "text-green-600"}
        bgClass={isSimulated ? "bg-orange-50" : "bg-green-50"}
        countText={descricao}
        countVisible={true}
        onClick={() =>
          isSimulated &&
          openPlanUpgradeDialog({
            feature: "automacao",
            defaultTab: PLANO_PROFISSIONAL,
          })
        }
        className={
          isSimulated
            ? "cursor-pointer hover:border-blue-200 transition-colors"
            : ""
        }
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Passageiros */}
      {renderPassengerCard(isEssential ? "success" : "info")}

      {/* 2. Automação (Sales ou Real) */}
      {renderAutomationCard()}

      {/* 3. Tempo */}
      {renderTimeCard()}
    </div>
  );
}
