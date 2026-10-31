import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ContratosList } from "@/components/features/contrato/ContratosList";
import { ContratosPagination } from "@/components/features/contrato/ContratosPagination";
import { ContratosToolbar } from "@/components/features/contrato/ContratosToolbar";
import { Banner } from "@/components/ui/Banner";
import { useContratosViewModel, safeCloseDialog } from "@/hooks";
import { ContratoTab } from "@/types/enums";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useTutorialsConfig } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileSignature, FileCheck2, ArrowUpRight } from "lucide-react";
import { useCallback } from "react";

const Contratos = () => {
  const { can } = usePermissions();
  const canManage = can("contratos.gerenciar");
  const { config: tutorialConfig, shouldShowTutorial } = useTutorialsConfig("contratos");

  const {
    activeTab,
    busca,
    setBusca,
    debouncedSearch,
    handleTabChange,
    kpis,
    contratos,
    page,
    limit,
    setLimit,
    totalRecords,
    totalPages,
    handlePageChange,
    isLoading,
    isLoadingKPIs,
    isLoadingContratos,
    isDownloading,
    isContratoAtivo,
    isContratoConfigurado,
    handleRefresh,
    handleOpenContractSetup,
    handleToggleContracts,
    isToggling,
    handleOpenPreview,
    handleOpenImportarContrato,
    isPreviewLoading,
    isPreviewPdfOpen,
    setIsPreviewPdfOpen,
    pdfUrl,
    anoLetivo,
    handleChangeAnoLetivo,
    actions,
  } = useContratosViewModel();

  const handleKpiClick = useCallback((tab: ContratoTab) => {
    handleTabChange(tab);
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setTimeout(() => {
        const anchor = document.getElementById("contratos-tabs-anchor");
        if (anchor) {
          anchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  }, [handleTabChange]);

  if (!canManage) {
    return <AccessRestrictedState moduleName="Gestão de Contratos" />;
  }

  const countSemContrato = kpis?.semContrato ?? 0;
  const countPendentes = kpis?.pendentes ?? 0;
  const countAssinados = kpis?.assinados ?? 0;

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 pb-24 pt-1 sm:pt-2">
          {!isContratoAtivo && !isContratoConfigurado && (
            <Banner
              variant="info"
              title="Configure seu modelo de contrato"
              description="Ajuste suas cláusulas, multas e assinatura para começar a gerar contratos para os responsáveis dos alunos."
              action={{
                label: "Ajustar Contrato",
                onClick: handleOpenContractSetup,
              }}
              className="rounded-[22px]"
            />
          )}

          {!isContratoAtivo && isContratoConfigurado && (
            <Banner
              variant="warning"
              title="Uso de Contratos Desativado"
              description="Reative para voltar a gerar contratos para seus alunos."
              action={{
                label: "Reativar Contratos",
                onClick: () => handleToggleContracts(true),
                isLoading: isToggling,
              }}
              className="rounded-[22px]"
            />
          )}

          <div className="hidden sm:grid sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleKpiClick(ContratoTab.SEM_CONTRATO)}
              className={cn(
                "p-5 rounded-[24px] bg-white border text-left transition-all active:scale-[0.99] group shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer w-auto overflow-hidden",
                activeTab === ContratoTab.SEM_CONTRATO
                  ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                  : "border-[#e5e5e5] hover:border-[#737373]/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                <span
                  className="text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                  title="Sem Contrato"
                >
                  Sem Contrato
                </span>
                <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                {isLoadingKPIs ? (
                  <Skeleton className="h-8 w-16 rounded-[10px] bg-[#f5f5f5]" />
                ) : (
                  <span className="text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                    {countSemContrato}
                  </span>
                )}
                <span className="flex text-xs font-normal text-[#737373] group-hover:text-[#0a0a0a] transition-colors items-center gap-0.5 shrink-0">
                  Ver alunos
                  <ArrowUpRight className="w-3 h-3 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleKpiClick(ContratoTab.PENDENTES)}
              className={cn(
                "p-5 rounded-[24px] bg-white border text-left transition-all active:scale-[0.99] group shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer w-auto overflow-hidden",
                activeTab === ContratoTab.PENDENTES
                  ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                  : "border-[#e5e5e5] hover:border-[#737373]/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                <span
                  className="text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                  title="Pendentes"
                >
                  Pendentes
                </span>
                <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                  <FileSignature className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                {isLoadingKPIs ? (
                  <Skeleton className="h-8 w-16 rounded-[10px] bg-[#f5f5f5]" />
                ) : (
                  <span className="text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                    {countPendentes}
                  </span>
                )}
                <span className="flex text-xs font-normal text-[#737373] group-hover:text-[#0a0a0a] transition-colors items-center gap-0.5 shrink-0">
                  Aguardando assinatura
                  <ArrowUpRight className="w-3 h-3 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleKpiClick(ContratoTab.ASSINADOS)}
              className={cn(
                "p-5 rounded-[24px] bg-white border text-left transition-all active:scale-[0.99] group shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer w-auto overflow-hidden",
                activeTab === ContratoTab.ASSINADOS
                  ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                  : "border-[#e5e5e5] hover:border-[#737373]/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                <span
                  className="text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
                  title="Assinados"
                >
                  Assinados
                </span>
                <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                {isLoadingKPIs ? (
                  <Skeleton className="h-8 w-16 rounded-[10px] bg-[#f5f5f5]" />
                ) : (
                  <span className="text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                    {countAssinados}
                  </span>
                )}
                <span className="flex text-xs font-normal text-[#737373] group-hover:text-[#0a0a0a] transition-colors items-center gap-0.5 shrink-0">
                  Com validade jurídica
                  <ArrowUpRight className="w-3 h-3 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
                </span>
              </div>
            </button>
          </div>

          <Tabs
            id="contratos-tabs-anchor"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-4 sm:space-y-5 scroll-mt-20"
          >
              <ContratosToolbar
                busca={busca}
                setBusca={setBusca}
                activeTab={activeTab}
                countPendentes={kpis?.pendentes}
                countSemContrato={kpis?.semContrato}
                countAssinados={kpis?.assinados}
                anoLetivo={anoLetivo}
                onChangeAnoLetivo={handleChangeAnoLetivo}
                isLoadingKPIs={isLoadingKPIs}
                onOpenConfig={handleOpenContractSetup}
                onOpenPreview={handleOpenPreview}
                onImportarContrato={() => handleOpenImportarContrato()}
                isDesativado={!isContratoAtivo}
                isContratoConfigurado={isContratoConfigurado}
                onToggleContratos={handleToggleContracts}
                isToggling={isToggling}
                isPreviewLoading={isPreviewLoading}
              />

              {anoLetivo !== new Date().getFullYear() && (
                <Banner
                  variant="info"
                  description={`Visualizando contratos gerados para o Ano Letivo ${anoLetivo}.`}
                />
              )}

              {busca.trim().length > 0 && (
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="text-xs font-medium text-[#737373]">
                    Resultado da busca por &quot;{busca.trim()}&quot;
                  </span>
                  {isLoadingContratos ? (
                    <Skeleton className="h-4 w-20 rounded-[8px] bg-[#f5f5f5]" />
                  ) : (
                    <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
                      {totalRecords}{" "}
                      {totalRecords === 1 ? "ENCONTRADO" : "ENCONTRADOS"}
                    </span>
                  )}
                </div>
              )}

              <TabsContent value={ContratoTab.SEM_CONTRATO} className="mt-0 outline-none">
                <ContratosList
                  data={contratos}
                  isLoading={isLoading}
                  activeTab={ContratoTab.SEM_CONTRATO}
                  busca={debouncedSearch}
                  isDesativado={!isContratoAtivo}
                  isContratoConfigurado={isContratoConfigurado}
                  isDownloading={isDownloading}
                  {...actions}
                />
              </TabsContent>

              <TabsContent value={ContratoTab.PENDENTES} className="mt-0 outline-none">
                <ContratosList
                  data={contratos}
                  isLoading={isLoading}
                  activeTab={ContratoTab.PENDENTES}
                  busca={debouncedSearch}
                  isDesativado={!isContratoAtivo}
                  isContratoConfigurado={isContratoConfigurado}
                  isDownloading={isDownloading}
                  {...actions}
                />
              </TabsContent>

              <TabsContent value={ContratoTab.ASSINADOS} className="mt-0 outline-none">
                <ContratosList
                  data={contratos}
                  isLoading={isLoading}
                  activeTab={ContratoTab.ASSINADOS}
                  busca={debouncedSearch}
                  isDesativado={!isContratoAtivo}
                  isContratoConfigurado={isContratoConfigurado}
                  isDownloading={isDownloading}
                  {...actions}
                />
              </TabsContent>

              <ContratosPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalRecords}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={setLimit}
              />
            </Tabs>
        </div>
      </PullToRefreshWrapper>

      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        isLoading={isPreviewLoading}
        onClose={() => safeCloseDialog(() => setIsPreviewPdfOpen(false))}
        pdfUrl={pdfUrl}
        title="Prévia do Contrato"
        fileName="modelo_contrato.pdf"
        showDownload={true}
      />

      {shouldShowTutorial && (
        <VideoCommerce
          screenName="contratos"
          previewUrl={tutorialConfig.previewUrl || tutorialConfig.videos[0]?.url || ""}
          videosData={[...tutorialConfig.videos]}
          tooltipText={tutorialConfig.tooltipText}
          ctaText={tutorialConfig.ctaText}
          onCtaClick={handleOpenContractSetup}
          positionClasses="fixed bottom-[calc(7rem+var(--safe-area-bottom,0px))] sm:bottom-[calc(8rem+var(--safe-area-bottom,0px))] md:bottom-8 left-4 md:left-auto md:right-8 z-40"
          requireScrollOnMobile={false}
          storageKey={STORAGE_KEYS.GUIDE_CONTRATOS_DISMISSED}
        />
      )}
    </>
  );
};

export default Contratos;
