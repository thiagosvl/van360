import { DateNavigation } from "@/components/common/DateNavigation";
import { RelatoriosEntradas } from "@/components/features/relatorios/RelatoriosEntradas";
import { RelatoriosOperacional } from "@/components/features/relatorios/RelatoriosOperacional";
import { RelatoriosSaidas } from "@/components/features/relatorios/RelatoriosSaidas";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import {
  EntradasSkeleton,
  OperacionalSkeleton,
  SaidasSkeleton,
  VisaoGeralSkeleton,
} from "@/components/skeletons/RelatoriosSkeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { NativeSelect } from "@/components/ui/native-select";
import { Bus } from "lucide-react";
import { useRelatoriosViewModel } from "@/hooks/ui/useRelatoriosViewModel";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { RelatorioTab, FilterDefaults } from "@/types/enums";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useTutorialsConfig } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";

export default function Relatorios() {
  const { can } = usePermissions();
  const { config: tutorialConfig, shouldShowTutorial } = useTutorialsConfig("relatorios");
  const {
    mes,
    ano,
    activeTab,
    veiculoId,
    handleNavigate,
    setActiveTab,
    setVeiculoId,
    refreshAll,
    dados,
    veiculosList,
    isLoading,
    isLoadingEntradas,
    isLoadingSaidas,
    isLoadingOperacional,
  } = useRelatoriosViewModel();

  if (!can("relatorios.visualizar")) {
    return <AccessRestrictedState moduleName="Relatórios Financeiros" />;
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={refreshAll}>
      <div className="min-h-screen bg-canvas max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
        <DateNavigation mes={mes} ano={ano} onNavigate={handleNavigate} />

        {veiculosList.length > 0 && (
          <div className="relative z-10 w-full px-1">
            <div className="flex flex-col">
              <label className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider ml-1 mb-1.5">
                Veículo Selecionado
              </label>
              <NativeSelect
                icon={<Bus className="h-4 w-4" />}
                value={veiculoId || FilterDefaults.TODOS}
                onChange={(e) => setVeiculoId(e.target.value)}
                className="bg-white shadow-xs"
              >
                <option value={FilterDefaults.TODOS}>Todos os Veículos</option>
                {veiculosList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} - {formatarPlacaExibicao(v.placa)}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-4 sm:space-y-6"
        >
          <AppTabNav
            activeTab={activeTab}
            items={[
              {
                value: RelatorioTab.VISAO_GERAL,
                label: "Visão Geral",
              },
              {
                value: RelatorioTab.ENTRADAS,
                label: "Entradas",
              },
              {
                value: RelatorioTab.SAIDAS,
                label: "Saídas",
              },
              {
                value: RelatorioTab.OPERACIONAL,
                label: "Operacional",
              },
            ]}
          />

          <TabsContent value={RelatorioTab.VISAO_GERAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0 transform-gpu will-change-transform">
            {isLoading ? <VisaoGeralSkeleton /> : <RelatoriosVisaoGeral dados={dados.visaoGeral} />}
          </TabsContent>

          <TabsContent value={RelatorioTab.ENTRADAS} className="mt-0 focus-visible:outline-none focus-visible:ring-0 transform-gpu will-change-transform">
            {isLoadingEntradas ? <EntradasSkeleton /> : <RelatoriosEntradas dados={dados.entradas} />}
          </TabsContent>

          <TabsContent value={RelatorioTab.SAIDAS} className="mt-0 focus-visible:outline-none focus-visible:ring-0 transform-gpu will-change-transform">
            {isLoadingSaidas ? <SaidasSkeleton /> : <RelatoriosSaidas dados={dados.saidas} />}
          </TabsContent>

          <TabsContent value={RelatorioTab.OPERACIONAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0 transform-gpu will-change-transform">
            {isLoadingOperacional ? <OperacionalSkeleton /> : <RelatoriosOperacional dados={dados.operacional} />}
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefreshWrapper>

      {shouldShowTutorial && (
        <VideoCommerce
          screenName="relatorios"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_RELATORIOS_DISMISSED}
        />
      )}
    </>
  );
}
