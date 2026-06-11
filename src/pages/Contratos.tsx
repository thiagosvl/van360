import { Button } from "@/components/ui/button";
import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { ContratosList } from "@/components/features/contrato/ContratosList";
import { ContratosToolbar } from "@/components/features/contrato/ContratosToolbar";
import { AlertCircle } from "lucide-react";

import { useContratosViewModel } from "@/hooks";
import { ContratoTab } from "@/types/enums";

const Contratos = () => {
  const {
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
    isContratoConfigurado,
    handleRefresh,
    handleOpenContractSetup,
    handleActivateContracts,
    handleToggleContracts,
    isToggling,
    handleOpenPreview,
    isPreviewLoading,
    isPreviewPdfOpen,
    setIsPreviewPdfOpen,
    pdfUrl,
    actions,
  } = useContratosViewModel();

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6">


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
              isContratoConfigurado={isContratoConfigurado}
              onToggleContratos={handleToggleContracts}
              isToggling={isToggling}
              isPreviewLoading={isPreviewLoading}
            />

            {/* Banner: Não Configurado */}
            {!isContratoAtivo && !isContratoConfigurado && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm mx-1">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-900 tracking-tight">Você ainda não configurou os contratos</h4>
                    <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                      Ative e configure essa funcionalidade para gerar contratos em PDF automaticamente para seus passageiros.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleOpenContractSetup}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-5 rounded-xl whitespace-nowrap shadow-sm w-full sm:w-auto shrink-0"
                >
                  Configurar Agora
                </Button>
              </div>
            )}

            {/* Banner: Desativado (Mas já configurado) */}
            {!isContratoAtivo && isContratoConfigurado && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm mx-1">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">Uso de Contratos Desativado</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      A emissão e o gerenciamento de contratos em PDF para seus passageiros estão desativados. Reative para voltar a utilizar.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleContracts(true)}
                  disabled={isToggling}
                  className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs h-10 px-5 rounded-xl whitespace-nowrap shadow-sm w-full sm:w-auto shrink-0"
                >
                  Reativar Contratos
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between px-1 mt-2">
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
