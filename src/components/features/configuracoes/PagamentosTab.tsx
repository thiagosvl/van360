import { memo, useMemo } from "react";
import { PagamentosTabSkeleton } from "@/components/skeletons";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabNav, AppTabItem } from "@/components/ui/AppTabNav";
import {
  usePagamentosTabViewModel,
  MODO_COBRANCA,
  ModoCobranca,
  PAGAMENTOS_SUB_TAB,
  PagamentosSubTab,
} from "@/hooks/ui/usePagamentosTabViewModel";
import { ModalidadeCobrancaSection } from "./pagamentos/ModalidadeCobrancaSection";
import { ChavePixSection } from "./pagamentos/ChavePixSection";
import { LembretesPaisSection } from "./pagamentos/LembretesPaisSection";
import { TaxaLiquidacaoSection } from "./pagamentos/TaxaLiquidacaoSection";
import { Bell, Key, Percent } from "lucide-react";

export { MODO_COBRANCA };
export type { ModoCobranca };

export const PagamentosTab = memo(function PagamentosTab() {
  const {
    configSectionRef,
    isLoading,
    isBusy,
    activeSubTab,
    setActiveSubTab,
    modoVisual,
    changingTargetModo,
    updatingKey,
    taxaEfetiva,
    taxaFormatada,
    enviarRecibo,
    quantidadeExcecoesAtuais,
    chavePixDisplay,
    veiculos,
    deveExibirChavesPorVeiculo,
    configuracoes,
    localDias,
    handleSelectModo,
    handleOpenEditarPixPadrao,
    handleOpenEditarPixVeiculo,
    handleOpenPreviewCobranca,
    handleWatchVideoCobrancaAutomatica,
    handleToggleAviso,
    handleDiasStep,
    handleToggleReciboAutomatico,
  } = usePagamentosTabViewModel();

  const tabItems = useMemo<AppTabItem<PagamentosSubTab>[]>(() => {
    const items: AppTabItem<PagamentosSubTab>[] = [
      {
        value: PAGAMENTOS_SUB_TAB.PIX,
        label: "Chaves Pix",
        icon: <Key className="w-4 h-4" />,
      },
    ];

    if (modoVisual === MODO_COBRANCA.AUTOMATICA) {
      items.push({
        value: PAGAMENTOS_SUB_TAB.ENCARGOS,
        label: "Taxas, Multa e Juros",
        icon: <Percent className="w-4 h-4" />,
      });
    }

    items.push({
      value: PAGAMENTOS_SUB_TAB.ENVIOS,
      label: "Envios no WhatsApp",
      icon: <Bell className="w-4 h-4" />,
    });

    return items;
  }, [modoVisual]);

  if (isLoading) {
    return <PagamentosTabSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <ModalidadeCobrancaSection
        modoVisual={modoVisual}
        changingTargetModo={changingTargetModo}
        isBusy={isBusy}
        taxaFormatada={taxaFormatada}
        quantidadeExcecoesAtuais={quantidadeExcecoesAtuais}
        onSelectModo={handleSelectModo}
        onWatchVideo={handleWatchVideoCobrancaAutomatica}
        onOpenPreviewCobranca={handleOpenPreviewCobranca}
      />

      {modoVisual !== MODO_COBRANCA.DESATIVADO && (
        <div ref={configSectionRef} className="scroll-mt-20">
          <Tabs
            value={activeSubTab}
            onValueChange={(val) => setActiveSubTab(val as PagamentosSubTab)}
            className="w-full space-y-4"
          >
            <AppTabNav
              activeTab={activeSubTab}
              items={tabItems}
              layout="fill"
            />

            <TabsContent value={PAGAMENTOS_SUB_TAB.PIX} className="mt-0 outline-none">
              <ChavePixSection
                modoVisual={modoVisual}
                isBusy={isBusy}
                chavePixDisplay={chavePixDisplay}
                veiculos={veiculos}
                deveExibirChavesPorVeiculo={deveExibirChavesPorVeiculo}
                onOpenEditarPixPadrao={handleOpenEditarPixPadrao}
                onOpenEditarPixVeiculo={handleOpenEditarPixVeiculo}
              />
            </TabsContent>

            {modoVisual === MODO_COBRANCA.AUTOMATICA && (
              <TabsContent value={PAGAMENTOS_SUB_TAB.ENCARGOS} className="mt-0 outline-none">
                <TaxaLiquidacaoSection
                  taxaEfetiva={taxaEfetiva}
                  taxaFormatada={taxaFormatada}
                />
              </TabsContent>
            )}

            <TabsContent value={PAGAMENTOS_SUB_TAB.ENVIOS} className="mt-0 outline-none">
              <LembretesPaisSection
                modoVisual={modoVisual}
                isBusy={isBusy}
                updatingKey={updatingKey}
                configuracoes={configuracoes}
                localDias={localDias}
                enviarRecibo={enviarRecibo}
                onOpenPreviewCobranca={() => handleOpenPreviewCobranca()}
                onToggleAviso={handleToggleAviso}
                onDiasStep={handleDiasStep}
                onToggleReciboAutomatico={handleToggleReciboAutomatico}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
});
