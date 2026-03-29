import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCobrancasViewModel } from "@/hooks";
import { CobrancaTab, KPICardVariant } from "@/types/enums";
import { formatCurrency, meses } from "@/utils/formatters";

export default function Cobrancas() {
  const {
    profile,
    isProfileLoading,
    mesFilter,
    anoFilter,
    handleNavigation,
    totalAReceber,
    totalRecebido,
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

  const isPending = activeTab === CobrancaTab.ARECEBER;
  const busca = isPending ? buscaAReceber : buscaRecebidos;
  const setBusca = isPending ? setBuscaAReceber : setBuscaRecebidos;

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 bg-white">
        <p className="font-medium animate-pulse uppercase tracking-widest text-xs">Carregando...</p>
      </div>
    );
  }

  const actionProps = {
    onVerCarteirinha: navigateToPassageiro,
    onEditarCobranca: handleEditCobrancaClick,
    onRegistrarPagamento: openPaymentDialog,
    onExcluirCobranca: handleDeleteCobrancaClick,
    onActionSuccess: () => { },
  };

  const currentCount = activeTab === CobrancaTab.ARECEBER ? countAReceber : countRecebidos;
  const statusLabel = activeTab === CobrancaTab.ARECEBER ? "PENDENTES" : "RECEBIDOS";

  return (
    <div className="space-y-6">
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="max-w-4xl mx-auto space-y-6">
          <DateNavigation
            mes={mesFilter}
            ano={anoFilter}
            onNavigate={handleNavigation}
          />

          <div className="grid grid-cols-2 gap-4 px-1">
            <KPICard
              label="A receber no mês"
              value={formatCurrency(totalAReceber)}
              variant={KPICardVariant.PRIMARY}
            />
            <KPICard
              label="Total Recebido"
              value={formatCurrency(totalRecebido)}
              variant={KPICardVariant.OUTLINE}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <div className="flex flex-col gap-5">
              <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
                <TabsList className="grid grid-cols-2 w-full h-[52px] bg-transparent p-0 gap-1 mt-0">
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
                    value={CobrancaTab.RECEBIDOS}
                    className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                  >
                    Recebidos
                    <span className={cn(
                      "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                      activeTab === CobrancaTab.RECEBIDOS ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
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
                {activeTab === CobrancaTab.ARECEBER ? "Próximos Vencimentos" : "Histórico de Recebimentos"}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {currentCount} {statusLabel}
              </span>
            </div>

            <TabsContent value={CobrancaTab.ARECEBER} className="mt-1 outline-none">
              <CobrancasList
                activeTab={CobrancaTab.ARECEBER}
                cobrancas={cobrancasAReceber}
                isLoading={isInitialLoading}
                busca={buscaAReceber}
                mesFilter={mesFilter}
                meses={meses}
                {...actionProps}
              />
            </TabsContent>

            <TabsContent value={CobrancaTab.RECEBIDOS} className="mt-1 outline-none">
              <CobrancasList
                activeTab={CobrancaTab.RECEBIDOS}
                cobrancas={cobrancasRecebidas}
                isLoading={isInitialLoading}
                busca={buscaRecebidos}
                mesFilter={mesFilter}
                meses={meses}
                {...actionProps}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="sistema.sucesso.processando" />
    </div>
  );
}
