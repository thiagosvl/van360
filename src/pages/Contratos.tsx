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
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <KPICard
                  title="Pendentes"
                  value={kpis?.pendentes ?? 0}
                  icon={Send}
                  bgClass="bg-blue-50"
                  colorClass="text-blue-600"
                  countVisible={false}
                  format="number"
                />
                <KPICard
                  title="Assinados"
                  value={kpis?.assinados ?? 0}
                  icon={CheckCircle2}
                  bgClass="bg-green-50"
                  colorClass="text-green-600"
                  countVisible={false}
                  format="number"
                />
                <KPICard
                  title="Sem Contrato"
                  value={kpis?.semContrato ?? 0}
                  icon={UserX}
                  bgClass="bg-orange-50"
                  colorClass="text-orange-600"
                  countVisible={false}
                  format="number"
                  className="col-span-2 md:col-span-1"
                />
              </div>

              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
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

                <TabsContent value={ContratoTab.PENDENTES} className="mt-0">
                  <ContratosList
                    data={contratos}
                    isLoading={isLoading}
                    activeTab={ContratoTab.PENDENTES}
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>

                <TabsContent value={ContratoTab.ASSINADOS} className="mt-0">
                  <ContratosList
                    data={contratos}
                    isLoading={isLoading}
                    activeTab={ContratoTab.ASSINADOS}
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>

                <TabsContent value={ContratoTab.SEM_CONTRATO} className="mt-0">
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
