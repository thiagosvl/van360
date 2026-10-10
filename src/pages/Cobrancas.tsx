import { DateNavigation } from "@/components/common/DateNavigation";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { CobrancasPagination } from "@/components/features/cobranca/CobrancasPagination";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCobrancasViewModel, useLayout, useProfile, usePassageiros } from "@/hooks";
import { CobrancaTab } from "@/types/enums";
import { Cobranca } from "@/types/cobranca";
import { monthNamesInBR as meses } from "@/utils/dateUtils";
import { Banner } from "@/components/ui/Banner";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useTutorialsConfig, safeCloseDialog } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";
import { buildReciboWhatsAppMessage } from "@/utils/whatsappTemplates";
import { isPassageiroIncompleto } from "@/utils/domain";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
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
    activeTab,
    handleTabChange,
    buscaAReceber,
    setBuscaAReceber,
    buscaRecebidos,
    setBuscaRecebidos,
    cobrancasAReceber,
    cobrancasRecebidas,
    paginatedCobrancasAReceber,
    paginatedCobrancasRecebidas,
    pageAReceber,
    setPageAReceber,
    pageRecebidas,
    setPageRecebidas,
    limit,
    setLimit,
    totalPagesAReceber,
    totalPagesRecebidas,
    isInitialLoading,
    isFutureMonth,
    isPastMonth,
    isCurrentMonth,
    pullToRefreshReload,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  } = useCobrancasViewModel();

  const {
    openReceiptDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFinanceiroDialog,
  } = useLayout();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id, status: "ativo", limit: 500 },
    { enabled: Boolean(profile?.id) }
  );

  const alunosSemValor = useMemo(() => {
    const list = passageirosData?.list || [];
    return list.filter((p) => !p.isento && (!p.valor_cobranca || Number(p.valor_cobranca) <= 0));
  }, [passageirosData?.list]);

  if (!can("cobrancas.gerenciar")) {
    return <AccessRestrictedState moduleName="Cobranças e Finanças" />;
  }

  const isPending = activeTab === CobrancaTab.ARECEBER;
  const busca = isPending ? buscaAReceber : buscaRecebidos;
  const setBusca = isPending ? setBuscaAReceber : setBuscaRecebidos;

  const actionProps = {
    onVerCarteirinha: navigateToPassageiro,
    onEditarCobranca: handleEditCobrancaClick,
    onRegistrarPagamento: (cobranca: Cobranca) => {
      if (cobranca.isProjection && isPassageiroIncompleto(cobranca.passageiro)) {
        openConfirmationDialog({
          title: "Valor das parcelas não configurado",
          description:
            "Para registrar o pagamento desta previsão, primeiro é necessário definir o valor e o vencimento da parcela. Deseja configurar agora?",
          confirmText: "Configurar agora",
          cancelText: "Fazer depois",
          onConfirm: () => {
            safeCloseDialog(closeConfirmationDialog);
            setTimeout(() => {
              if (cobranca.passageiro) {
                openPassageiroFinanceiroDialog({ passageiro: cobranca.passageiro });
              }
            }, 100);
          },
        });
        return;
      }
      openPaymentDialog(cobranca);
    },
    onExcluirCobranca: handleDeleteCobrancaClick,
    onVerRecibo: (url: string, cobranca: Cobranca) =>
      openReceiptDialog({
        receiptUrl: url,
        cobrancaDescricao: buildReciboWhatsAppMessage({
          nomeResponsavel: cobranca.passageiro?.responsavel_principal?.nome,
          nomePassageiro: cobranca.passageiro?.nome || "",
          generoPassageiro: cobranca.passageiro?.genero,
          mes: cobranca.mes,
          ano: cobranca.ano,
        }),
        cobrancaId: cobranca.id,
        mes: cobranca.mes,
        ano: cobranca.ano,
        passageiroId: cobranca.passageiro_id,
        nomePassageiro: cobranca.passageiro?.nome,
        nomeResponsavel: cobranca.passageiro?.responsavel_principal?.nome,
        generoPassageiro: cobranca.passageiro?.genero,
      }),
    onActionSuccess: () => { },
  };

  const currentCount = activeTab === CobrancaTab.ARECEBER ? countAReceber : countRecebidos;

  let statusLabel = "";
  if (busca) {
    statusLabel = currentCount === 1 ? "ENCONTRADA" : "ENCONTRADAS";
  } else {
    statusLabel = "PARCELAS";
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
          <DateNavigation
            mes={mesFilter}
            ano={anoFilter}
            onNavigate={handleNavigation}
          />

          {alunosSemValor.length > 0 && (
            <div className="px-1">
              <Banner
                variant="warning"
                title={`${alunosSemValor.length} ${alunosSemValor.length === 1 ? "aluno sem o valor da parcela" : "alunos sem o valor da parcela"}`}
                description="Toque para preencher rapidamente."
                onClick={() => navigate("/alunos/atualizacao-rapida?semValor=true")}
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
              <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full sm:w-fit overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x shrink-0">
                <TabsList className="bg-transparent min-h-[38px] sm:min-h-[42px] p-0 gap-1 border-0 w-full sm:w-auto grid grid-cols-2 sm:flex">
                  <TabsTrigger
                    value={CobrancaTab.ARECEBER}
                    className={cn(
                      "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                      "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                      "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
                    )}
                  >
                    A Receber
                    <span className={cn(
                      "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                      activeTab === CobrancaTab.ARECEBER
                        ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                        : "text-[#737373]"
                    )}>
                      {countAReceber || 0}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value={CobrancaTab.RECEBIDAS}
                    className={cn(
                      "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                      "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                      "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
                    )}
                  >
                    Recebidas
                    <span className={cn(
                      "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                      activeTab === CobrancaTab.RECEBIDAS
                        ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                        : "text-[#737373]"
                    )}>
                      {countRecebidos || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="relative group w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#737373] group-focus-within:text-[#0a0a0a] transition-colors" />
                </div>
                <Input
                  type="search"
                  placeholder="Buscar aluno ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
                />
              </div>
            </div>

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
              <CobrancasPagination
                currentPage={pageAReceber}
                totalPages={totalPagesAReceber}
                totalItems={cobrancasAReceber.length}
                limit={limit}
                onPageChange={setPageAReceber}
                onLimitChange={setLimit}
                className="mt-4"
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
              <CobrancasPagination
                currentPage={pageRecebidas}
                totalPages={totalPagesRecebidas}
                totalItems={cobrancasRecebidas.length}
                limit={limit}
                onPageChange={setPageRecebidas}
                onLimitChange={setLimit}
                className="mt-4"
              />
            </TabsContent>

          </Tabs>
        </div>
      </PullToRefreshWrapper>

      {/* {shouldShowTutorial && (
        <VideoCommerce
          screenName="parcelas"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_COBRANCAS_DISMISSED}
        />
      )} */}
    </>
  );
}
