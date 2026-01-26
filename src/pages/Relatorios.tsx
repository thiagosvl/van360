import { DateNavigation } from "@/components/common/DateNavigation";
import { RelatoriosEntradas } from "@/components/features/relatorios/RelatoriosEntradas";
import { RelatoriosOperacional } from "@/components/features/relatorios/RelatoriosOperacional";
import { RelatoriosSaidas } from "@/components/features/relatorios/RelatoriosSaidas";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRelatoriosViewModel } from "@/hooks/ui/useRelatoriosViewModel";

export default function Relatorios() {
  const {
    mes,
    ano,
    activeTab,
    handleNavigate,
    setActiveTab,
    refreshAll,
    dados,
    profilePlano
  } = useRelatoriosViewModel();

  if (!profilePlano) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="relative min-h-screen space-y-6 bg-gray-50/50">
      <PullToRefreshWrapper onRefresh={refreshAll}>
        {/* Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <DateNavigation mes={mes} ano={ano} onNavigate={handleNavigate} />
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
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
            <RelatoriosVisaoGeral dados={dados.visaoGeral} />
          </TabsContent>

          {/* Aba 2: Entradas */}
          <TabsContent value="entradas">
            <RelatoriosEntradas dados={dados.entradas} />
          </TabsContent>

          {/* Aba 3: Saídas */}
          <TabsContent value="saidas">
            <RelatoriosSaidas dados={dados.saidas} />
          </TabsContent>

          {/* Aba 4: Operacional */}
          <TabsContent value="operacional">
            <RelatoriosOperacional
              dados={dados.operacional}
              automacao={dados.automacao}
              IsProfissionalPlan={!!profilePlano?.is_profissional}
            />
          </TabsContent>
        </Tabs>
      </PullToRefreshWrapper>
    </div>
  );
}
