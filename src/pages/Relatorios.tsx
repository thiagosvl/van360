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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bus } from "lucide-react";
import { useRelatoriosViewModel } from "@/hooks/ui/useRelatoriosViewModel";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { RelatorioTab, FilterDefaults } from "@/types/enums";

export default function Relatorios() {
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

  if (isLoading) {
    return <RelatoriosSkeleton activeTab={activeTab} />;
  }

  return (
    <PullToRefreshWrapper onRefresh={refreshAll}>
      <div className="space-y-6">
        {/* Header & Navigation */}
        <DateNavigation mes={mes} ano={ano} onNavigate={handleNavigate} />

        {/* Vehicle Filter */}
        {veiculosList.length > 0 && (
          <div className="relative z-10 w-full px-1">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 ml-1 mb-1.5">
                Veículo Selecionado
              </label>
              <Select value={veiculoId || FilterDefaults.TODOS} onValueChange={setVeiculoId}>
                <div className="relative">
                  <Bus className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                  <SelectTrigger className="pl-12 h-12 w-full rounded-xl bg-white border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-slate-700 font-medium">
                    <SelectValue placeholder="Selecione o Veículo" />
                  </SelectTrigger>
                </div>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value={FilterDefaults.TODOS} className="font-medium text-sm rounded-xl focus:bg-slate-50 cursor-pointer">
                    Todos os Veículos
                  </SelectItem>
                  {veiculosList.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="font-medium text-sm rounded-xl focus:bg-slate-50 cursor-pointer">
                      {v.marca} {v.modelo} - {formatarPlacaExibicao(v.placa)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <div className="bg-slate-200/50 p-1 rounded-[1.25rem] overflow-x-auto scrollbar-hide">
            <TabsList className="flex w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
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

          <TabsContent value={RelatorioTab.VISAO_GERAL} className="mt-0 focus-visible:outline-none focus-visible:ring-0 transform-gpu will-change-transform">
            <RelatoriosVisaoGeral dados={dados.visaoGeral} />
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
  );
}
