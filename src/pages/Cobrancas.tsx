import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCobrancasViewModel, useLayout } from "@/hooks";
import { CobrancaTab } from "@/types/enums";
import { Cobranca } from "@/types/cobranca";
import { monthNamesInBR as meses } from "@/utils/dateUtils";

export default function Cobrancas() {
  const {
    mesFilter,
    anoFilter,
    handleNavigation,
    totalAReceber,
    totalRecebido,
    totalAtrasado,
    totalPrevisto,
    countAReceber,
    countRecebidos,
    activeTab,
    handleTabChange,
    buscaAReceber,
    setBuscaAReceber,
    buscaRecebidos,
    setBuscaRecebidos,
    cobrancasAReceber,
    cobrancasRecebidas,
    isInitialLoading,
    isActionLoading,
    pullToRefreshReload,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  } = useCobrancasViewModel();

  const { openReceiptDialog } = useLayout();

  const isPending = activeTab === CobrancaTab.ARECEBER;
  const busca = isPending ? buscaAReceber : buscaRecebidos;
  const setBusca = isPending ? setBuscaAReceber : setBuscaRecebidos;

  const actionProps = {
    onVerCarteirinha: navigateToPassageiro,
    onEditarCobranca: handleEditCobrancaClick,
    onRegistrarPagamento: openPaymentDialog,
    onExcluirCobranca: handleDeleteCobrancaClick,
    onVerRecibo: (url: string, cobranca: Cobranca) => openReceiptDialog({
      receiptUrl: url,
      cobrancaDescricao: `Recibo de ${cobranca.mes}/${cobranca.ano} - ${cobranca.passageiro?.nome || ""}`,
    }),
    onActionSuccess: () => { },
  };

  const currentCount = activeTab === CobrancaTab.ARECEBER ? countAReceber : countRecebidos;

  let statusLabel = "";
  if (busca) {
    statusLabel = currentCount === 1 ? "ENCONTRADA" : "ENCONTRADAS";
  } else {
    if (activeTab === CobrancaTab.ARECEBER) {
      statusLabel = currentCount === 1 ? "PARCELAS" : "PARCELAS";
    } else {
      statusLabel = currentCount === 1 ? "PARCELAS" : "PARCELAS";
    }
  }

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-6">
        <DateNavigation
          mes={mesFilter}
          ano={anoFilter}
          onNavigate={handleNavigation}
        />

        <div className="px-1">
          <FinancialDashboardCard
            totalEsperado={totalPrevisto}
            recebido={totalRecebido}
            pendente={totalAReceber}
            atrasado={totalAtrasado}
            loading={isInitialLoading}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full space-y-6"
        >
          <div className="flex flex-col gap-5">
            <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
              <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
                <TabsTrigger
                  value={CobrancaTab.ARECEBER}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                >
                  A Receber
                  <span className={cn(
                    "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                    activeTab === CobrancaTab.ARECEBER ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                  )}>
                    {countAReceber || 0}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value={CobrancaTab.RECEBIDAS}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                >
                  Recebidas
                  <span className={cn(
                    "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                    activeTab === CobrancaTab.RECEBIDAS ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                  )}>
                    {countRecebidos || 0}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className={cn(
                  "h-4 w-4 transition-colors",
                  busca ? "text-amber-500" : "text-slate-400 group-focus-within:text-[#1a3a5c]"
                )} />
              </div>
              <Input
                type="search"
                placeholder="Buscar por passageiro ou responsável..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all border-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
              {activeTab === CobrancaTab.ARECEBER ? "A Receber" : "Recebidas"}
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {currentCount} {statusLabel}
            </span>
          </div>

          <TabsContent value={CobrancaTab.ARECEBER} className="mt-1 outline-none transform-gpu will-change-transform">
            <CobrancasList
              activeTab={CobrancaTab.ARECEBER}
              cobrancas={cobrancasAReceber}
              isLoading={isInitialLoading}
              busca={buscaAReceber}
              mesFilter={mesFilter}
              meses={meses}
              onClearSearch={() => setBusca("")}
              {...actionProps}
            />
          </TabsContent>

          <TabsContent value={CobrancaTab.RECEBIDAS} className="mt-1 outline-none transform-gpu will-change-transform">
            <CobrancasList
              activeTab={CobrancaTab.RECEBIDAS}
              cobrancas={cobrancasRecebidas}
              isLoading={isInitialLoading}
              busca={buscaRecebidos}
              mesFilter={mesFilter}
              meses={meses}
              onClearSearch={() => setBusca("")}
              {...actionProps}
            />
          </TabsContent>

        </Tabs>
      </div>
    </PullToRefreshWrapper>
  );
}
