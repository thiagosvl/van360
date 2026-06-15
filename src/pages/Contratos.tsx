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
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm mx-1 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100/50 text-[#1a3a5c] shrink-0 border border-blue-200/50">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#1a3a5c] tracking-tight">Você ainda não pode gerar contratos</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Para gerar contratos, antes você precisa configurar os valores de multa, de juros e também a sua assinatura.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOpenContractSetup}
                  className="h-10 px-5 bg-[#1a3a5c] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1a3a5c]/90 transition-all shadow-md shadow-[#1a3a5c]/20 shrink-0 active:scale-95 w-full sm:w-auto text-center flex justify-center items-center"
                >
                  Configurar Agora
                </button>
              </div>
            )}

            {/* Banner: Desativado (Mas já configurado) */}
            {!isContratoAtivo && isContratoConfigurado && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm mx-1 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-200 text-slate-600 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 tracking-tight">Uso de Contratos Desativado</p>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      A emissão e o gerenciamento de contratos em PDF para seus passageiros estão desativados. Reative para voltar a utilizar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleContracts(true)}
                  disabled={isToggling}
                  className="h-10 px-5 bg-[#1a3a5c] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1a3a5c]/90 transition-all shadow-md shadow-slate-200/50 shrink-0 active:scale-95 w-full sm:w-auto text-center flex justify-center items-center disabled:opacity-50"
                >
                  Reativar Contratos
                </button>
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
