import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { CobrancasToolbar } from "@/components/features/cobranca/CobrancasToolbar";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCobrancasViewModel } from "@/hooks";
import { CobrancaTab } from "@/types/enums";
import { meses } from "@/utils/formatters";
import { CheckCircle2, TrendingUp, Wallet } from "lucide-react";

export default function Cobrancas() {
  const {
    profile,
    isProfileLoading,
    mesFilter,
    anoFilter,
    handleNavigation,
    totalAReceber,
    totalRecebido,
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
    navigateToDetails,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  } = useCobrancasViewModel();

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  const actionProps = {
    onVerCobranca: navigateToDetails,
    onVerCarteirinha: navigateToPassageiro,
    onEditarCobranca: handleEditCobrancaClick,
    onRegistrarPagamento: openPaymentDialog,
    onExcluirCobranca: handleDeleteCobrancaClick,
    onActionSuccess: () => { },
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DateNavigation
              mes={mesFilter}
              ano={anoFilter}
              onNavigate={handleNavigation}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <KPICard
              title="A Receber"
              value={totalAReceber}
              count={countAReceber}
              icon={Wallet}
              bgClass="bg-orange-50"
              colorClass="text-orange-600"
            />
            <KPICard
              title="Recebido"
              value={totalRecebido}
              count={countRecebidos}
              icon={CheckCircle2}
              bgClass="bg-green-50"
              colorClass="text-green-600"
            />
            <KPICard
              title="Total Previsto"
              value={totalPrevisto}
              count={countAReceber + countRecebidos}
              icon={TrendingUp}
              bgClass="bg-blue-50"
              colorClass="text-blue-600"
              className="col-span-2 md:col-span-1"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
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

            <TabsContent value={CobrancaTab.ARECEBER} className="mt-0">
              <CobrancasList
                variant="pending"
                cobrancas={cobrancasAReceber}
                isLoading={isInitialLoading}
                busca={buscaAReceber}
                mesFilter={mesFilter}
                meses={meses}
                {...actionProps}
              />
            </TabsContent>

            <TabsContent value={CobrancaTab.RECEBIDOS} className="mt-0">
              <CobrancasList
                variant="paid"
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
    </>
  );
}
