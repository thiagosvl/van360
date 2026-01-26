import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancas, useEscolas, useGastos, usePassageiros, useVeiculos } from "@/hooks";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useRelatoriosCalculations } from "@/hooks/business/useRelatoriosCalculations";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useRelatoriosViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageTitle } = useLayout();
  
  // 1. URL State Management (Tabs)
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["visao-geral", "entradas", "saidas", "operacional"];
    return tabParam && validTabs.includes(tabParam) ? tabParam : "visao-geral";
  }, [searchParams]);

  const setActiveTab = useCallback((value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Sync default tab
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setActiveTab("visao-geral");
    }
  }, [searchParams, setActiveTab]);

  // Update Page Title
  useEffect(() => {
    setPageTitle("Relatórios");
  }, [setPageTitle]);

  // 2. Local State Management (Date)
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  const handleNavigate = useCallback((newMes: number, newAno: number) => {
    setMes(newMes);
    setAno(newAno);
  }, []);

  // 3. Smart Data Fetching
  const { profile, plano: profilePlano } = usePermissions();
  const usuarioId = profile?.id;

  // Always fetch Summary (Base for Visão Geral and Metadata)
  // RefetchOnMount: "always" guarantees freshness on navigation as requested
  const { 
    data: systemSummary, 
    refetch: refetchSummary, 
    isLoading: isLoadingSummary 
  } = useUsuarioResumo(usuarioId, { mes, ano });

  // Conditional Fetches based on Active Tab
  const shouldFetchEntradas = activeTab === "entradas";
  const shouldFetchSaidas = activeTab === "saidas";
  const shouldFetchOperacional = activeTab === "operacional";

  const { data: cobrancasData, refetch: refetchCobrancas } = useCobrancas(
    { usuarioId, mes, ano },
    { enabled: !!usuarioId && shouldFetchEntradas }
  );

  const { data: gastosData, refetch: refetchGastos } = useGastos(
    { usuarioId, mes, ano },
    { enabled: !!usuarioId && shouldFetchSaidas }
  );

  // Operational Data (Passageiros/Escolas/Veiculos) - Needed for 'Operacional'
  // Note: Veiculos is also needed for 'Saidas' to map expenses
  const { data: passageirosData, refetch: refetchPassageiros } = usePassageiros(
    { usuarioId },
    { enabled: !!usuarioId && shouldFetchOperacional }
  );

  const { data: escolasData, refetch: refetchEscolas } = useEscolas(
    { usuarioId },
    { enabled: !!usuarioId && shouldFetchOperacional }
  );

  const { data: veiculosData, refetch: refetchVeiculos } = useVeiculos(
    { usuarioId },
    { enabled: !!usuarioId && (shouldFetchOperacional || shouldFetchSaidas) }
  );

  // 4. Data Processing (Calculations)
  const dados = useRelatoriosCalculations({
    financeiro: systemSummary?.financeiro, // Prioritize backend summary
    cobrancasData: shouldFetchEntradas ? cobrancasData : undefined,
    gastosData: shouldFetchSaidas ? gastosData : undefined,
    passageirosData: shouldFetchOperacional ? passageirosData : undefined,
    escolasData: shouldFetchOperacional ? escolasData : undefined,
    veiculosData: (shouldFetchOperacional || shouldFetchSaidas) ? veiculosData : undefined,
    profilePlano,
    profile,
  });

  // Override automation count with precise data from backend summary if available
  const countAutomacao = systemSummary?.contadores.passageiros.com_automacao ?? 0;
  const dadosOperacional = useMemo(() => ({
    ...dados,
    automacao: {
      ...dados.automacao,
      envios: countAutomacao,
    },
  }), [dados, countAutomacao]);

  const refreshAll = useCallback(async () => {
    const promises: Promise<any>[] = [refetchSummary()];
    if (shouldFetchEntradas) promises.push(refetchCobrancas());
    if (shouldFetchSaidas) promises.push(refetchGastos(), refetchVeiculos());
    if (shouldFetchOperacional) promises.push(refetchPassageiros(), refetchEscolas(), refetchVeiculos());
    
    await Promise.all(promises);
  }, [
    refetchSummary, 
    refetchCobrancas, 
    refetchGastos, 
    refetchPassageiros, 
    refetchEscolas, 
    refetchVeiculos, 
    shouldFetchEntradas, 
    shouldFetchSaidas, 
    shouldFetchOperacional
  ]);

  return {
    // State
    mes,
    ano,
    activeTab,
    
    // Actions
    setMes,
    setAno,
    handleNavigate,
    setActiveTab,
    refreshAll,
    
    // Data
    dados: activeTab === "operacional" ? dadosOperacional : dados,
    profilePlano,
    
    // Status
    isLoading: isLoadingSummary // Main loading state
  };
}
