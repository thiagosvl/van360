import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { AlertCircle, CheckCircle2, FileText, Send, UserX } from "lucide-react";

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
    isContratoAtivo,
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
      <div className="flex-1 flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Banner de Estado Desativado */}
          {!isContratoAtivo && (
            <DashboardStatusCard
              type="pending"
              title="Contratos Desativados"
              description="Para gerar, editar ou substituir contratos, você precisa ativar o módulo. Por enquanto, as ações de alteração estão bloqueadas, mas seus dados continuam disponíveis para consulta."
              actionLabel="Ativar Agora"
              onAction={handleOpenContractSetup}
            />
          )}

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
              isDesativado={!isContratoAtivo}
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
                isDesativado={!isContratoAtivo}
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
                {...actions}
              />
            </TabsContent>

            <TabsContent value={ContratoTab.SEM_CONTRATO} className="mt-0 outline-none">
              <ContratosList
                data={contratos}
                isLoading={isLoading}
                activeTab={ContratoTab.SEM_CONTRATO}
                busca={debouncedSearch}
                isDesativado={!isContratoAtivo}
                {...actions}
              />
            </TabsContent>
          </Tabs>
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
