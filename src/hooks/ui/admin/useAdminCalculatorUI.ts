import { useState, useCallback } from "react";
import { useAdminCalculator } from "@/hooks/business/admin/useAdminCalculator";
import { toast } from "sonner";

export function useAdminCalculatorUI() {
  const calc = useAdminCalculator();
  const [activeTab, setActiveTab] = useState<"simulador" | "dre">("simulador");
  const [chartMode, setChartMode] = useState<"mensal" | "acumulado">("mensal");

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }, []);

  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  }, []);

  const formatPercent = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const handleSaveScenario = useCallback(() => {
    calc.saveScenario();
    toast.success("Cenário salvo com sucesso!");
  }, [calc]);

  const handleResetScenario = useCallback(() => {
    calc.clearScenario();
    toast.info("Cenário restaurado para os dados padrão.");
  }, [calc]);

  return {
    ...calc,
    activeTab,
    setActiveTab,
    chartMode,
    setChartMode,
    formatCurrency,
    formatNumber,
    formatPercent,
    handleSaveScenario,
    handleResetScenario,
  };
}

export type AdminCalculatorUIHook = ReturnType<typeof useAdminCalculatorUI>;
