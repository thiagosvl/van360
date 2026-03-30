import { DateNavigation } from "@/components/common/DateNavigation";
import { RelatoriosEntradas } from "@/components/features/relatorios/RelatoriosEntradas";
import { RelatoriosOperacional } from "@/components/features/relatorios/RelatoriosOperacional";
import { RelatoriosSaidas } from "@/components/features/relatorios/RelatoriosSaidas";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import {
  EntradasSkeleton,
  OperacionalSkeleton,
  RelatoriosSkeleton,
  SaidasSkeleton,
} from "@/components/skeletons/RelatoriosSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRelatoriosViewModel } from "@/hooks/ui/useRelatoriosViewModel";

import { RelatorioTab } from "@/types/enums";

export default function Relatorios() {
  const {
    mes,
    ano,
    activeTab,
    handleNavigate,
    setActiveTab,
    refreshAll,
    dados,
    isLoading,
    isLoadingEntradas,
    isLoadingSaidas,
    isLoadingOperacional,
  } = useRelatoriosViewModel();

  if (isLoading) {
    return <RelatoriosSkeleton activeTab={activeTab} />;
  }

  return (
    <div className="space-y-6">
      <PullToRefreshWrapper onRefresh={refreshAll}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header & Navigation */}
          <DateNavigation mes={mes} ano={ano} onNavigate={handleNavigate} />

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full space-y-6"
          >
            <div className="bg-slate-200/50 p-1 rounded-[1.25rem] overflow-x-auto scrollbar-hide">
              <TabsList className="flex w-full h-[52px] bg-transparent p-0 gap-1 mt-0 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
                <TabsTrigger
                  value={RelatorioTab.VISAO_GERAL}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value={RelatorioTab.ENTRADAS}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
                >
                  Entradas
                </TabsTrigger>
                <TabsTrigger
                  value={RelatorioTab.SAIDAS}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
                >
                  Saídas
                </TabsTrigger>
                <TabsTrigger
                  value={RelatorioTab.OPERACIONAL}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
                >
                  Operacional
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={RelatorioTab.VISAO_GERAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <RelatoriosVisaoGeral dados={dados.visaoGeral} />
            </TabsContent>

            <TabsContent value={RelatorioTab.ENTRADAS} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {isLoadingEntradas ? <EntradasSkeleton /> : <RelatoriosEntradas dados={dados.entradas} />}
            </TabsContent>

            <TabsContent value={RelatorioTab.SAIDAS} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {isLoadingSaidas ? <SaidasSkeleton /> : <RelatoriosSaidas dados={dados.saidas} />}
            </TabsContent>

            <TabsContent value={RelatorioTab.OPERACIONAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {isLoadingOperacional ? <OperacionalSkeleton /> : <RelatoriosOperacional dados={dados.operacional} />}
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>
    </div>
  );
}
