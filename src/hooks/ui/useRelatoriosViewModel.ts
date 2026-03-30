import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancas, useEscolas, useGastos, usePassageiros, useVeiculos } from "@/hooks";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { useProfile } from "@/hooks/business/useProfile";
import { useRelatoriosCalculations } from "@/hooks/business/useRelatoriosCalculations";
import { RelatorioTab } from "@/types/enums";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useRelatoriosViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageTitle } = useLayout();
  
  // 1. URL State Management (Tabs)
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = Object.values(RelatorioTab) as string[];
    return tabParam && validTabs.includes(tabParam) ? tabParam : RelatorioTab.VISAO_GERAL;
  }, [searchParams]);

  const setActiveTab = useCallback((value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Sync default tab
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setActiveTab(RelatorioTab.VISAO_GERAL);
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
  const { profile } = useProfile();
  const usuarioId = profile?.id;

  // Always fetch Summary (Base for Visão Geral and Metadata)
  const { 
    data: systemSummary, 
    refetch: refetchSummary, 
    isLoading: isLoadingSummary 
  } = useUsuarioResumo(usuarioId, { mes, ano });

  // Conditional Fetches based on Active Tab
  const shouldFetchEntradas = activeTab === RelatorioTab.ENTRADAS;
  const shouldFetchSaidas = activeTab === RelatorioTab.SAIDAS;
  const shouldFetchOperacional = activeTab === RelatorioTab.OPERACIONAL;

  const { data: cobrancasData, refetch: refetchCobrancas, isLoading: isLoadingCobrancas } = useCobrancas(
    { usuarioId, mes, ano },
    { enabled: !!usuarioId && shouldFetchEntradas }
  );

  const { data: gastosData, refetch: refetchGastos, isLoading: isLoadingGastos } = useGastos(
    { usuarioId, mes, ano },
    { enabled: !!usuarioId && shouldFetchSaidas }
  );

  // Operational Data (Passageiros/Escolas/Veiculos) - Needed for 'Operacional'
  const { data: passageirosData, refetch: refetchPassageiros, isLoading: isLoadingPassageiros } = usePassageiros(
    { usuarioId },
    { enabled: !!usuarioId && shouldFetchOperacional }
  );

  const { data: escolasData, refetch: refetchEscolas, isLoading: isLoadingEscolas } = useEscolas(
    { usuarioId },
    { enabled: !!usuarioId && shouldFetchOperacional }
  );

  const { data: veiculosData, refetch: refetchVeiculos, isLoading: isLoadingVeiculos } = useVeiculos(
    { usuarioId },
    { enabled: !!usuarioId && (shouldFetchOperacional || shouldFetchSaidas) }
  );

  // 4. Data Processing (Calculations)
  const dados = useRelatoriosCalculations({
    financeiro: systemSummary?.financeiro,
    cobrancasData: shouldFetchEntradas ? cobrancasData : undefined,
    gastosData: shouldFetchSaidas ? gastosData : undefined,
    passageirosData: shouldFetchOperacional ? passageirosData : undefined,
    escolasData: shouldFetchOperacional ? escolasData : undefined,
    veiculosData: (shouldFetchOperacional || shouldFetchSaidas) ? veiculosData : undefined,
    profile,
  });

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
    dados,
    
    // Status
    isLoading: isLoadingSummary,
    isLoadingEntradas: shouldFetchEntradas && isLoadingCobrancas,
    isLoadingSaidas: shouldFetchSaidas && (isLoadingGastos || isLoadingVeiculos),
    isLoadingOperacional: shouldFetchOperacional && (isLoadingPassageiros || isLoadingEscolas || isLoadingVeiculos),
  };
}
