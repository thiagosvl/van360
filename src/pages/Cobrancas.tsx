import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { CobrancasToolbar } from "@/components/features/cobranca/CobrancasToolbar";
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
    navigateToDetails,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  } = useCobrancasViewModel();

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 bg-[#F8FAFB]">
        <p className="font-medium animate-pulse">Carregando informações...</p>
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
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="max-w-4xl mx-auto space-y-6">
          <DateNavigation
            mes={mesFilter}
            ano={anoFilter}
            onNavigate={handleNavigation}
          />

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <CobrancasToolbar
              buscaAReceber={buscaAReceber}
              setBuscaAReceber={setBuscaAReceber}
              buscaRecebidos={buscaRecebidos}
              setBuscaRecebidos={setBuscaRecebidos}
              countAReceber={countAReceber}
              countRecebidos={countRecebidos}
              activeTab={activeTab}
            />

            <div className="grid grid-cols-2 gap-4 px-1">
              <KPICard
                label="TOTAL PENDENTE"
                value={formatCurrency(totalAReceber)}
                variant={KPICardVariant.PRIMARY}
              />
              <KPICard
                label="TOTAL RECEBIDO"
                value={formatCurrency(totalRecebido)}
                variant={KPICardVariant.OUTLINE}
              />
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
