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
}

export function AssinaturaDashboard({
  plano,
  assinatura,
  metricas,
  cobrancas,
  onPagarClick,
  onCancelClick
}: AssinaturaDashboardProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* 1. Header (Status & Primary Action) */}
      <SubscriptionHeader 
        plano={plano} 
        assinatura={assinatura} 
        onPagarClick={() => {
            // Find pending or open modal
            const pendente = cobrancas.find(c => c.status === 'pendente_pagamento');
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
             <SubscriptionHistory cobrancas={cobrancas} onPagarClick={onPagarClick} />
        </div>

        {/* Sidebar: Settings/Cancel */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Sua Assinatura</h3>
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between items-center">
                        <span>Valor Mensal</span>
                        <span className="font-medium text-gray-900">
                             {Number(assinatura.preco_aplicado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>Passageiros no Automático</span>
                        <span className="font-medium text-gray-900">
                             {metricas.franquiaContratada > 0 ? metricas.franquiaContratada : "Não incluso"}
                        </span>
                    </div>
                </div>
                <SubscriptionSettings onCancelClick={onCancelClick} plano={plano} />
             </div>
        </div>

      </div>

    </div>
  );
}
