
import { DateNavigation } from "@/components/common/DateNavigation";
import { UpgradeStickyFooter } from "@/components/common/UpgradeStickyFooter";

import { RelatoriosEntradas } from "@/components/features/relatorios/RelatoriosEntradas";
import { RelatoriosOperacional } from "@/components/features/relatorios/RelatoriosOperacional";
import { RelatoriosSaidas } from "@/components/features/relatorios/RelatoriosSaidas";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURE_RELATORIOS, PLANO_ESSENCIAL } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCobrancas,
  useEscolas,
  useGastos,
  usePassageiros,
  useVeiculos
} from "@/hooks";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useRelatoriosCalculations } from "@/hooks/business/useRelatoriosCalculations";
import { useSession } from "@/hooks/business/useSession";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Relatorios() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state from URL
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["visao-geral", "entradas", "saidas", "operacional"];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "visao-geral"; // Default
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", value);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );
  
  // Sync tab to URL on mount if not present
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (!currentTab || !["visao-geral", "entradas", "saidas", "operacional"].includes(currentTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "visao-geral");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { setPageTitle, openPlanUpgradeDialog } = useLayout();
  const { user } = useSession();
  
  // Use Access Control Hook
  const { profile, plano: profilePlano, canViewModuleRelatorios } = usePermissions();
  const { limits: planLimits } = usePlanLimits();

  const permissions = {
      canViewRelatorios: canViewModuleRelatorios
  };
    
  const limits = {
      passageiros: planLimits.passengers.limit
  };

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());


  // Access Logic
  const hasAccess = true;

  // Buscar dados reais - SEMPRE (para instant unlock e background blur)
  const shouldFetchFinancials = !!profile?.id;
  // Metadados (escolas, veículos, passageiros) busca sempre para exibir listas
  const shouldFetchMetadata = !!profile?.id;

  const { data: cobrancasData, refetch: refetchCobrancas } = useCobrancas(
    {
      usuarioId: profile?.id,
      mes,
      ano,
    },
    { enabled: shouldFetchFinancials }
  );

  const { data: gastosData = [], refetch: refetchGastos } = useGastos(
    {
      usuarioId: profile?.id,
      mes,
      ano,
    },
    { enabled: shouldFetchFinancials }
  );

  const { data: passageirosData, refetch: refetchPassageiros } = usePassageiros(
    { usuarioId: profile?.id },
    { enabled: shouldFetchMetadata }
  );

  const { data: escolasData, refetch: refetchEscolas } = useEscolas({ usuarioId: profile?.id }, {
    enabled: shouldFetchMetadata,
  });

  const { data: veiculosData, refetch: refetchVeiculos } = useVeiculos({ usuarioId: profile?.id }, {
    enabled: shouldFetchMetadata,
  });

  // Calcular dados reais
  const dados = useRelatoriosCalculations({
    hasAccess,
    cobrancasData,
    gastosData,
    passageirosData,
    escolasData,
    veiculosData,
    profilePlano,
    profile,
  });

  useEffect(() => {
    setPageTitle("Relatórios");
  }, [setPageTitle]);

  const handleNavigate = (newMes: number, newAno: number) => {
    setMes(newMes);
    setAno(newAno);
  };

// ... (removed import)

  // Buscar contagem precisa de automação (mesma lógica da Assinatura)
  const { data: systemSummary, refetch: refetchSummary } = useUsuarioResumo();
  const countAutomacao = systemSummary?.contadores.passageiros.com_automacao ?? 0;

  const pullToRefreshReload = async () => {
    if (!hasAccess) return;
    await Promise.all([
      refetchCobrancas(),
      refetchGastos(),
      refetchPassageiros(),
      refetchEscolas(),
      refetchVeiculos(),
      refetchSummary(),
    ]);
  };

  if (!profilePlano) {
    return <div>Carregando...</div>;
  }

  // Override dos dados de automação com a contagem precisa
  const dadosOperacional = {
      ...dados,
      automacao: {
          ...dados.automacao,
          envios: countAutomacao,
          tempoEconomizado: `${Math.round(countAutomacao * 0.08)}h` // Recalcular tempo com base na contagem correta
      }
  };

  return (
    <div className="relative min-h-screen pb-20 space-y-6 bg-gray-50/50">
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      {/* Premium Banner (Top of Page) */}


      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DateNavigation
          mes={mes}
          ano={ano}
          onNavigate={handleNavigate}
          disabled={!hasAccess}
        />
      </div>

      {/* Desktop Alert Banner for No Access */}


      {/* Main Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full space-y-6 pt-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 md:h-12 inline-flex w-auto min-w-full md:min-w-0">
              <TabsTrigger
                value="visao-geral"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="entradas"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Entradas
              </TabsTrigger>
              <TabsTrigger
                value="saidas"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Saídas
              </TabsTrigger>
              <TabsTrigger
                value="operacional"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Operacional
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Aba 1: Visão Geral */}
        <TabsContent value="visao-geral">
          <RelatoriosVisaoGeral
            dados={dados.visaoGeral}
            hasAccess={hasAccess}
          />
        </TabsContent>

        {/* Aba 2: Entradas */}
        <TabsContent value="entradas">
          <RelatoriosEntradas
            dados={dados.entradas}
            hasAccess={hasAccess}
          />
        </TabsContent>

        {/* Aba 3: Saídas */}
        <TabsContent value="saidas">
          <RelatoriosSaidas dados={dados.saidas} hasAccess={hasAccess} />
        </TabsContent>

        {/* Aba 4: Operacional */}
        <TabsContent value="operacional">
          <RelatoriosOperacional
            dados={dadosOperacional.operacional}
            automacao={dadosOperacional.automacao}
            hasAccess={hasAccess}
            limits={limits}
            IsProfissionalPlan={!!profilePlano?.isProfissionalPlan}
          />
        </TabsContent>
      </Tabs>
      </PullToRefreshWrapper>
      {/* Mobile Sticky Footer for No Access */}
      <UpgradeStickyFooter
        visible={!hasAccess}
        title="Você sabe o lucro exato da sua van?"
        description="Veja seus números reais."
        buttonText="Ver meu Lucro Real"
        onAction={() => openPlanUpgradeDialog({
           feature: FEATURE_RELATORIOS,
           defaultTab: PLANO_ESSENCIAL,
        })}
        storageKey="footer_relatorios_v2"
      />
      

    </div>
  );
}
