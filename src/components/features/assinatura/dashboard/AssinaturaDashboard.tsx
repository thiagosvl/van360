import { SubscriptionHeader } from "./SubscriptionHeader";
import { SubscriptionHistory } from "./SubscriptionHistory";
import { SubscriptionKPIs } from "./SubscriptionKPIs";
import { SubscriptionSettings } from "./SubscriptionSettings";

interface AssinaturaDashboardProps {
  plano: any;
  assinatura: any;
  metricas: {
    passageirosAtivos: number;
    limitePassageiros: number | null;
    cobrancasEmUso: number;
    franquiaContratada: number;
  };
  cobrancas: any[];
  onPagarClick: (cobranca: any) => void;
  onCancelClick: () => void;
  onRefresh?: () => void;
}

export function AssinaturaDashboard({
  plano,
  assinatura,
  metricas,
  cobrancas,
  onPagarClick,
  onCancelClick,
  onRefresh,
}: AssinaturaDashboardProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Header (Status & Primary Action) */}
      <SubscriptionHeader
        plano={plano}
        assinatura={assinatura}
        passageirosAtivos={metricas.passageirosAtivos}
        onRefresh={onRefresh}
        onPagarClick={() => {
          // Find pending or open modal
          const pendente = cobrancas.find(
            (c) => c.status === "pendente_pagamento"
          );
          if (pendente) onPagarClick(pendente);
          else onPagarClick(null); // Triggers generic pay logic if logic exists
        }}
      />

      {/* 2. KPIs Strategy (FOMO, Pain, Success) */}
      <SubscriptionKPIs plano={plano} metricas={metricas} />

      {/* 3. History & Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: History */}
        <div className="lg:col-span-2 space-y-6">
          <SubscriptionHistory
            cobrancas={cobrancas}
            onPagarClick={onPagarClick}
          />
        </div>

        {/* Sidebar: Settings/Cancel */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Sua Assinatura
          </h3>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between items-center group">
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                  Valor Mensal
                </span>
                <span className="font-medium text-gray-700">
                  {Number(assinatura.preco_aplicado || 0).toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </span>
              </div>
              {assinatura?.vigencia_fim && (
                <div className="flex justify-between items-center group">
                  <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                    Renova em
                  </span>
                  <span className="font-medium text-gray-700">
                    {new Date(assinatura.vigencia_fim).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                </div>
              )}
            </div>
                <SubscriptionSettings 
                  onCancelClick={onCancelClick} 
                  plano={plano} 
                  passageirosAtivos={metricas.passageirosAtivos} 
                />
          </div>
        </div>
      </div>
    </div>
  );
}
