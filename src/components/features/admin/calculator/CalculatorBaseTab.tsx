import React from "react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";
import { CalculatorBaselineCard } from "./CalculatorBaselineCard";
import { CalculatorMetricsCards } from "./CalculatorMetricsCards";
import { CalculatorAutoBillingCard } from "./CalculatorAutoBillingCard";
import { CalculatorScaleSection } from "./CalculatorScaleSection";
import { CalculatorWabaSection } from "./CalculatorWabaSection";
import { CalculatorFixedCostsSection } from "./CalculatorFixedCostsSection";
import { CalculatorFiscalGatewaySection } from "./CalculatorFiscalGatewaySection";
import { CalculatorInsightsSection } from "./CalculatorInsightsSection";

interface CalculatorBaseTabProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorBaseTab({ calcHook }: CalculatorBaseTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Baseline Real da Produção (Sincronizado com Dashboard) */}
      <CalculatorBaselineCard calcHook={calcHook} />

      {/* 2. KPIs de Receita Bruta, Custos, Lucro Líquido e Unit Economics */}
      <CalculatorMetricsCards calcHook={calcHook} />

      {/* 3. Cobrança com Baixa Automática (Gateway de Alunos & Spread) */}
      <CalculatorAutoBillingCard calcHook={calcHook} />

      {/* 4. Grade de Parâmetros de Simulação e Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalculatorScaleSection calcHook={calcHook} />
        <CalculatorWabaSection calcHook={calcHook} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalculatorFixedCostsSection calcHook={calcHook} />
        <CalculatorFiscalGatewaySection calcHook={calcHook} />
      </div>

      {/* 5. Insights & Recomendações */}
      <CalculatorInsightsSection calcHook={calcHook} />
    </div>
  );
}
