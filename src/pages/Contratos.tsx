import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { CheckCircle2, FileText, Send, UserX } from "lucide-react";

import { KPICard } from "@/components/common/KPICard";
import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { ContratosList } from "@/components/features/contrato/ContratosList";
import { ContratosToolbar } from "@/components/features/contrato/ContratosToolbar";

import { useContratosViewModel } from "@/hooks";
import { ContratoTab } from "@/types/enums";

const Contratos = () => {
  const {
    profile,
    isProfileLoading,
    activeTab,
    busca,
    setBusca,
    debouncedSearch,
    handleTabChange,
    kpis,
    contratos,
    isLoading,
    isActionLoading,
    handleRefresh,
    handleOpenContractSetup,
    handleOpenPreview,
    isPreviewPdfOpen,
    setIsPreviewPdfOpen,
    pdfUrl,
    actions,
  } = useContratosViewModel();

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Feature Disabled State */}
          {!profile?.config_contrato?.usar_contratos && (
            <UnifiedEmptyState
              icon={FileText}
              title="Contratos Desativados"
              description={
                <div className="space-y-1">
                  <p>
                    Ative agora mesmo para gerar contratos e coletar assinaturas
                    digitais.
                  </p>
                </div>
              }
              action={{
                label: "Ativar Contratos",
                onClick: handleOpenContractSetup,
                icon: CheckCircle2,
              }}
              className="mt-8 border-dashed border-gray-300 bg-gray-50/50"
            />
          )}

          {/* Active State */}
          {profile?.config_contrato?.usar_contratos && (
            <>
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
                  countAssinados={kpis?.assinados}
                  countSemContrato={kpis?.semContrato}
                  onOpenConfig={handleOpenContractSetup}
                  onOpenPreview={handleOpenPreview}
                />

                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
                    {activeTab === ContratoTab.PENDENTES ? "Contratos Pendentes" :
                      activeTab === ContratoTab.ASSINADOS ? "Contratos Assinados" : "Sem Contrato"}
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {contratos.length} {busca ? "ENCONTRADOS" : activeTab === ContratoTab.SEM_CONTRATO ? "PASSAGEIROS" : "CONTRATOS"}
                  </span>
                </div>

                <TabsContent value={ContratoTab.PENDENTES} className="mt-0 outline-none">
                  <ContratosList
                    data={contratos}
                    isLoading={isLoading}
                    activeTab={ContratoTab.PENDENTES}
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>

                <TabsContent value={ContratoTab.ASSINADOS} className="mt-0 outline-none">
                  <ContratosList
                    data={contratos}
                    isLoading={isLoading}
                    activeTab={ContratoTab.ASSINADOS}
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>

                <TabsContent value={ContratoTab.SEM_CONTRATO} className="mt-0 outline-none">
                  <ContratosList
                    data={contratos}
                    isLoading={isLoading}
                    activeTab={ContratoTab.SEM_CONTRATO}
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        onClose={() => setIsPreviewPdfOpen(false)}
        pdfUrl={pdfUrl}
        title="Modelo do Contrato"
      />
    </>
  );
};

export default Contratos;
