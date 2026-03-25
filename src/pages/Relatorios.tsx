import { DateNavigation } from "@/components/common/DateNavigation";
import { RelatoriosEntradas } from "@/components/features/relatorios/RelatoriosEntradas";
import { RelatoriosOperacional } from "@/components/features/relatorios/RelatoriosOperacional";
import { RelatoriosSaidas } from "@/components/features/relatorios/RelatoriosSaidas";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
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
  } = useRelatoriosViewModel();

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
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
            <div className="bg-gray-100/40 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
              <TabsList className="flex w-full h-11 bg-transparent p-0 gap-1 mt-0 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
                <TabsTrigger
                  value={RelatorioTab.VISAO_GERAL}
                  className="rounded-xl h-full font-headline font-bold text-[11px] sm:text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400 px-4 flex-1 whitespace-nowrap"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value={RelatorioTab.ENTRADAS}
                  className="rounded-xl h-full font-headline font-bold text-[11px] sm:text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400 px-4 flex-1 whitespace-nowrap"
                >
                  Entradas
                </TabsTrigger>
                <TabsTrigger
                  value={RelatorioTab.SAIDAS}
                  className="rounded-xl h-full font-headline font-bold text-[11px] sm:text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400 px-4 flex-1 whitespace-nowrap"
                >
                  Saídas
                </TabsTrigger>
                <TabsTrigger
                  value={RelatorioTab.OPERACIONAL}
                  className="rounded-xl h-full font-headline font-bold text-[11px] sm:text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400 px-4 flex-1 whitespace-nowrap"
                >
                  Operacional
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Aba 1: Visão Geral */}
            <TabsContent value={RelatorioTab.VISAO_GERAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <RelatoriosVisaoGeral dados={dados.visaoGeral} />
            </TabsContent>

            {/* Aba 2: Entradas */}
            <TabsContent value={RelatorioTab.ENTRADAS} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <RelatoriosEntradas dados={dados.entradas} />
            </TabsContent>

            {/* Aba 3: Saídas */}
            <TabsContent value={RelatorioTab.SAIDAS} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <RelatoriosSaidas dados={dados.saidas} />
            </TabsContent>

            <TabsContent value={RelatorioTab.OPERACIONAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <RelatoriosOperacional dados={dados.operacional} />
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>
    </div>
  );
}
