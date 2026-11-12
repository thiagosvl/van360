import { DateNavigation } from "@/components/common/DateNavigation";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { CobrancaRecebidasPills } from "@/components/features/cobranca/CobrancaRecebidasPills";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { useCobrancasViewModel, useTutorialsConfig } from "@/hooks";
import { CobrancaTab } from "@/types/enums";
import { monthNamesInBR as meses } from "@/utils/dateUtils";
import { Banner } from "@/components/ui/Banner";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { STORAGE_KEYS } from "@/constants";

export default function Cobrancas() {
  const { can } = usePermissions();
  const { config: tutorialConfig, shouldShowTutorial } = useTutorialsConfig("parcelas");

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
    filteredCountRecebidos,
    origemRecebidasFilter,
    handleSelectOrigemRecebidas,
    hasRepasseNoMes,
    resumoOrigemRecebidas,
    activeTab,
    handleTabChange,
    buscaAReceber,
    setBuscaAReceber,
    buscaRecebidos,
    setBuscaRecebidos,
    paginatedCobrancasAReceber,
    paginatedCobrancasRecebidas,
    hasMoreAReceber,
    hasMoreRecebidas,
    handleLoadMoreAReceber,
    handleLoadMoreRecebidas,
    isInitialLoading,
    isFutureMonth,
    isPastMonth,
    isCurrentMonth,
    lembretesDesativados,
    lembretesAtivos,
    alunosSemValorCount,
    pullToRefreshReload,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    handleRegistrarPagamento,
    handleVerRecibo,
    handleNavigateConfigCobrancas,
    handleNavigateAlunosSemValor,
    handleOpenConhecerCobrancaAutomatica,
  } = useCobrancasViewModel();

  if (!can("cobrancas.gerenciar")) {
    return <AccessRestrictedState moduleName="Cobranças e Finanças" />;
  }

  const isPending = activeTab === CobrancaTab.ARECEBER;
  const busca = isPending ? buscaAReceber : buscaRecebidos;
  const setBusca = isPending ? setBuscaAReceber : setBuscaRecebidos;

  const actionProps = {
    onVerCarteirinha: navigateToPassageiro,
    onEditarCobranca: handleEditCobrancaClick,
    onRegistrarPagamento: handleRegistrarPagamento,
    onExcluirCobranca: handleDeleteCobrancaClick,
    onVerRecibo: handleVerRecibo,
    onActionSuccess: () => {},
  };

  const currentCount = activeTab === CobrancaTab.ARECEBER ? countAReceber : filteredCountRecebidos;
  const statusLabel = busca
    ? currentCount === 1
      ? "ENCONTRADA"
      : "ENCONTRADAS"
    : "PARCELAS";

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
          <DateNavigation
            mes={mesFilter}
            ano={anoFilter}
            onNavigate={handleNavigation}
          />

          {lembretesDesativados && (
            <div className="px-1">
              <Banner
                variant="neutral"
                title="Lembretes automáticos desativados"
                description="Toque para ativar os avisos de vencimento no WhatsApp para os responsáveis."
                onClick={handleNavigateConfigCobrancas}
                className="cursor-pointer"
              />
            </div>
          )}

          {lembretesAtivos && (
            <div className="px-1">
              <Banner
                variant="info"
                icon={<Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary shrink-0" />}
                title="Cansado de dar baixa e enviar recibos um por um?"
                description="Deixe o Van360 confirmar o pagamento, dar baixa na hora e enviar o recibo aos pais por você. Toque para conhecer."
                onClick={handleOpenConhecerCobrancaAutomatica}
                className="cursor-pointer"
              />
            </div>
          )}

          {alunosSemValorCount > 0 && (
            <div className="px-1">
              <Banner
                variant="warning"
                title={`${alunosSemValorCount} ${alunosSemValorCount === 1 ? "aluno sem o valor da parcela" : "alunos sem o valor da parcela"}`}
                description="Toque para preencher rapidamente."
                onClick={handleNavigateAlunosSemValor}
                className="cursor-pointer"
              />
            </div>
          )}

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
            className="w-full space-y-4 sm:space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <AppTabNav
                activeTab={activeTab}
                items={[
                  {
                    value: CobrancaTab.ARECEBER,
                    label: "A Receber",
                    badge: countAReceber || 0,
                  },
                  {
                    value: CobrancaTab.RECEBIDAS,
                    label: "Recebidas",
                    badge: countRecebidos || 0,
                  },
                ]}
              />

              <div className="relative group w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#737373] group-focus-within:text-[#0a0a0a] transition-colors" />
                </div>
                <Input
                  type="text"
                  inputMode="search"
                  placeholder="Buscar aluno ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className={cn(
                    "w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 text-sm font-normal transition-all shadow-none [&::-webkit-search-cancel-button]:hidden",
                    busca ? "pr-10" : "pr-4"
                  )}
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    aria-label="Limpar busca"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {activeTab === CobrancaTab.RECEBIDAS && hasRepasseNoMes && (
              <CobrancaRecebidasPills
                activeOrigem={origemRecebidasFilter}
                onSelectOrigem={handleSelectOrigemRecebidas}
                resumo={resumoOrigemRecebidas}
              />
            )}

            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
                {activeTab === CobrancaTab.ARECEBER ? "A Receber" : "Recebidas"}
              </h2>
              <span className="text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                {currentCount} {statusLabel}
              </span>
            </div>

            <TabsContent value={CobrancaTab.ARECEBER} className="mt-1 outline-none transform-gpu will-change-transform">
              <CobrancasList
                activeTab={CobrancaTab.ARECEBER}
                cobrancas={paginatedCobrancasAReceber}
                isLoading={isInitialLoading}
                busca={buscaAReceber}
                mesFilter={mesFilter}
                anoFilter={anoFilter}
                isFutureMonth={isFutureMonth}
                isPastMonth={isPastMonth}
                isCurrentMonth={isCurrentMonth}
                meses={meses}
                onClearSearch={() => setBusca("")}
                {...actionProps}
              />
              <LoadMoreButton
                hasMore={hasMoreAReceber}
                onLoadMore={handleLoadMoreAReceber}
              />
            </TabsContent>

            <TabsContent value={CobrancaTab.RECEBIDAS} className="mt-1 outline-none transform-gpu will-change-transform">
              <CobrancasList
                activeTab={CobrancaTab.RECEBIDAS}
                cobrancas={paginatedCobrancasRecebidas}
                isLoading={isInitialLoading}
                busca={buscaRecebidos}
                mesFilter={mesFilter}
                anoFilter={anoFilter}
                isFutureMonth={isFutureMonth}
                isPastMonth={isPastMonth}
                isCurrentMonth={isCurrentMonth}
                meses={meses}
                onClearSearch={() => setBusca("")}
                {...actionProps}
              />
              <LoadMoreButton
                hasMore={hasMoreRecebidas}
                onLoadMore={handleLoadMoreRecebidas}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      {shouldShowTutorial && (
        <VideoCommerce
          screenName="parcelas"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_COBRANCAS_DISMISSED}
        />
      )}
    </>
  );
}
