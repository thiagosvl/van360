import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { ContratosList } from "@/components/features/contrato/ContratosList";
import { ContratosToolbar } from "@/components/features/contrato/ContratosToolbar";
import { Banner } from "@/components/ui/Banner";

import { useContratosViewModel, safeCloseDialog } from "@/hooks";
import { ContratoTab } from "@/types/enums";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useTutorialsConfig } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";

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
    isLoading,
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
    actions,
  } = useContratosViewModel();

  if (!canManage) {
    return <AccessRestrictedState moduleName="Gestão de Contratos" />;
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <ContratosToolbar
              busca={busca}
              setBusca={setBusca}
              activeTab={activeTab}
              countPendentes={kpis?.pendentes}
              countSemContrato={kpis?.semContrato}
              countAssinados={kpis?.assinados}
              onOpenConfig={handleOpenContractSetup}
              onOpenPreview={handleOpenPreview}
              onImportarContrato={() => handleOpenImportarContrato()}
              isDesativado={!isContratoAtivo}
              isContratoConfigurado={isContratoConfigurado}
              onToggleContratos={handleToggleContracts}
              isToggling={isToggling}
              isPreviewLoading={isPreviewLoading}
            />

            {/* Banner: Não Configurado */}
            {!isContratoAtivo && !isContratoConfigurado && (
              <Banner
                variant="info"
                title="Ative seus contratos digitais"
                description="Configure sua assinatura e defina os valores de multa e juros para começar a gerar contratos para seus alunos."
                action={{
                  label: "Ativar Uso de Contratos",
                  onClick: handleOpenContractSetup,
                }}
                className="mx-1"
              />
            )}

            {/* Banner: Desativado (Mas já configurado) */}
            {!isContratoAtivo && isContratoConfigurado && (
              <Banner
                variant="neutral"
                title="Uso de Contratos Desativado"
                description="Reative para voltar a gerar contratos para os alunos."
                action={{
                  label: "Reativar Contratos",
                  onClick: () => handleToggleContracts(true),
                  isLoading: isToggling,
                }}
                className="mx-1"
              />
            )}

            <div className="flex items-center justify-between px-1 mt-2">
              <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
                {activeTab === ContratoTab.PENDENTES
                  ? "Assinaturas Pendentes"
                  : activeTab === ContratoTab.ASSINADOS
                    ? "Contratos Assinados"
                    : "Sem Contrato"}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {contratos.length}{" "}
                {busca
                  ? (contratos.length === 1 ? "ENCONTRADO" : "ENCONTRADOS")
                  : activeTab === ContratoTab.SEM_CONTRATO
                    ? (contratos.length === 1 ? "ALUNO" : "ALUNOS")
                    : (contratos.length === 1 ? "CONTRATO" : "CONTRATOS")}
              </span>
            </div>

            <TabsContent value={ContratoTab.SEM_CONTRATO} className="mt-0 outline-none transform-gpu will-change-transform">
              <ContratosList
                data={contratos}
                isLoading={isLoading}
                activeTab={ContratoTab.SEM_CONTRATO}
                busca={debouncedSearch}
                isDesativado={!isContratoAtivo}
                isDownloading={isDownloading}
                {...actions}
              />
            </TabsContent>

            <TabsContent value={ContratoTab.PENDENTES} className="mt-0 outline-none transform-gpu will-change-transform">
              <ContratosList
                data={contratos}
                isLoading={isLoading}
                activeTab={ContratoTab.PENDENTES}
                busca={debouncedSearch}
                isDesativado={!isContratoAtivo}
                isDownloading={isDownloading}
                {...actions}
              />
            </TabsContent>

            <TabsContent value={ContratoTab.ASSINADOS} className="mt-0 outline-none transform-gpu will-change-transform">
              <ContratosList
                data={contratos}
                isLoading={isLoading}
                activeTab={ContratoTab.ASSINADOS}
                busca={debouncedSearch}
                isDesativado={!isContratoAtivo}
                isDownloading={isDownloading}
                {...actions}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        isLoading={isPreviewLoading}
        onClose={() => safeCloseDialog(() => setIsPreviewPdfOpen(false))}
        pdfUrl={pdfUrl}
        title="Prévia do Contrato"
      />

      {shouldShowTutorial && (
        <VideoCommerce
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
