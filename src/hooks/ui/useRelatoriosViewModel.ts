import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancas, useEscolas, useGastos, usePassageiros, useVeiculos } from "@/hooks";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { useProfile } from "@/hooks/business/useProfile";
import { useRelatoriosCalculations } from "@/hooks/business/useRelatoriosCalculations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { RelatorioTab, FilterDefaults } from "@/types/enums";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getNowBR } from "@/utils/dateUtils";

export function useRelatoriosViewModel() {
  const { can, isSubConta } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageTitle } = useLayout();
  const { profile } = useProfile();
  const usuarioId = profile?.id;
  
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

  const veiculoId = useMemo(() => {
    const param = searchParams.get("veiculo_id");
    if (param && param !== FilterDefaults.TODOS) return param;
    if (isSubConta && profile?.veiculo_id) return profile.veiculo_id;
    return undefined;
  }, [searchParams, isSubConta, profile?.veiculo_id]);

  const setVeiculoId = useCallback((value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== FilterDefaults.TODOS) {
      newParams.set("veiculo_id", value);
    } else {
      newParams.delete("veiculo_id");
    }
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
  const [mes, setMes] = useState(getNowBR().getMonth() + 1);
  const [ano, setAno] = useState(getNowBR().getFullYear());

  const handleNavigate = useCallback((newMes: number, newAno: number) => {
    setMes(newMes);
    setAno(newAno);
  }, []);

  // 3. Smart Data Fetching
  const summaryParams = useMemo(
    () => ({ mes, ano, veiculoId }),
    [mes, ano, veiculoId]
  );

  // Always fetch Summary (Base for Visão Geral and Metadata)
  const { 
    data: systemSummary, 
    refetch: refetchSummary, 
    isLoading: isLoadingSummary 
  } = useUsuarioResumo(usuarioId, summaryParams, { enabled: !!usuarioId && can("relatorios.visualizar") });

  // Conditional Fetches based on Active Tab
  const shouldFetchEntradas = activeTab === RelatorioTab.ENTRADAS;
  const shouldFetchSaidas = activeTab === RelatorioTab.SAIDAS;
  const shouldFetchOperacional = activeTab === RelatorioTab.OPERACIONAL;

  const cobrancasFilters = useMemo(
    () => ({ usuarioId, mes, ano, veiculoId }),
    [usuarioId, mes, ano, veiculoId]
  );

  const { data: cobrancasData, refetch: refetchCobrancas, isLoading: isLoadingCobrancas } = useCobrancas(
    cobrancasFilters,
    { enabled: !!usuarioId && shouldFetchEntradas && (can("cobrancas.gerenciar") || can("financeiro.visualizar")) }
  );

  const gastosFilters = useMemo(
    () => ({ usuarioId, mes, ano, veiculoId }),
    [usuarioId, mes, ano, veiculoId]
  );

  const { data: gastosData, refetch: refetchGastos, isLoading: isLoadingGastos } = useGastos(
    gastosFilters,
    { enabled: !!usuarioId && shouldFetchSaidas && can("gastos.visualizar") }
  );

  // Operational Data (Passageiros/Escolas/Veiculos) - Needed for 'Operacional'
  const passageirosFilters = useMemo(
    () => ({ usuarioId, veiculo: veiculoId }),
    [usuarioId, veiculoId]
  );

  const { data: passageirosData, refetch: refetchPassageiros, isLoading: isLoadingPassageiros } = usePassageiros(
    passageirosFilters,
    { enabled: !!usuarioId && shouldFetchOperacional && (can("passageiros.visualizar") || can("passageiros.gerenciar")) }
  );

  const userQueryFilters = useMemo(
    () => ({ usuarioId }),
    [usuarioId]
  );

  const { data: escolasData, refetch: refetchEscolas, isLoading: isLoadingEscolas } = useEscolas(
    userQueryFilters,
    { enabled: !!usuarioId && shouldFetchOperacional && (can("escolas.visualizar") || can("escolas.gerenciar")) }
  );

  const { data: veiculosData, refetch: refetchVeiculos, isLoading: isLoadingVeiculos } = useVeiculos(
    userQueryFilters,
    { enabled: !!usuarioId && can("veiculos.gerenciar") }
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
    hasVeiculoFilter: !!veiculoId,
    contadores: systemSummary?.contadores,
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
    mes,
    ano,
    activeTab,
    veiculoId,
    
    setMes,
    setAno,
    handleNavigate,
    setActiveTab,
    setVeiculoId,
    refreshAll,
    
    // Data
    dados,
    veiculosList: veiculosData?.list || [],
    
    // Status
    isLoading: isLoadingSummary,
    isLoadingEntradas: shouldFetchEntradas && isLoadingCobrancas,
    isLoadingSaidas: shouldFetchSaidas && (isLoadingGastos || isLoadingVeiculos),
    isLoadingOperacional: shouldFetchOperacional && (isLoadingPassageiros || isLoadingEscolas || isLoadingVeiculos),
  };
}
