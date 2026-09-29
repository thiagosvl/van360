import { useEffect, useState } from "react";
import { Loader2, Settings, Trash2, Info, ChevronDown } from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RouteConfigSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { cn } from "@/lib/utils";
import { ConfigurarRotaItinerario } from "@/components/features/configurar-rota/ConfigurarRotaItinerario";
import { AdicionarParadaDialog } from "@/components/dialogs/AdicionarParadaDialog";
import PassageiroEnderecoFormDialog from "@/components/dialogs/PassageiroEnderecoFormDialog";
import { ReordenarParadaSheet } from "@/components/features/active-route/ReordenarParadaSheet";
import { useConfigurarRotaViewModel } from "@/hooks/ui/useConfigurarRotaViewModel";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";

function PontosDeAtencaoCollapse({ avisos }: { avisos: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!avisos || avisos.length === 0) return null;

  return (
    <div className="border border-blue-200/90 bg-blue-50/70 rounded-xl overflow-hidden shadow-2xs transition-all text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-blue-100/50 transition-colors select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 text-[#1a3a5c] shrink-0" />
          <span className="text-xs font-bold text-[#1a3a5c] truncate">
            {avisos.length === 1 ? "1 sugestão para sua rota" : `${avisos.length} sugestões para sua rota`}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-[#1a3a5c]/70 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-t border-blue-200/70 p-3 bg-blue-50/40 space-y-2 animate-in fade-in duration-150">
          {avisos.map((aviso, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-relaxed font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a3a5c] mt-1.5 shrink-0" />
              <span className="flex-1 break-words">{aviso}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConfigurarRota() {
  const vm = useConfigurarRotaViewModel();
  const { openRouteFormDialog, setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle(vm.isEditing ? "Editar Rota" : "Nova Rota");
  }, [setPageTitle, vm.isEditing]);

  if (!vm.can("rotas.criar_editar")) {
    return <AccessRestrictedState moduleName="Configuração de Rotas" />;
  }

  if (vm.isLoading) {
    return <RouteConfigSkeleton count={4} />;
  }

  const handleOpenEditRouteDialog = () => {
    openRouteFormDialog({
      editingRoute: {
        nome: vm.formData.nome,
        veiculoId: vm.formData.veiculoId,
        escolaFixaId: vm.formData.escolaFixaId,
      },
      onSuccess: (data) => {
        vm.setFormData((prev) => ({
          ...prev,
          nome: data.nome,
          veiculoId: data.veiculoId,
          escolaFixaId: data.escolaFixaId || "",
        }));
      },
    });
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { }}>
      <form onSubmit={vm.handleSubmit} className="text-left pb-12 max-w-2xl mx-auto relative">
        <div className="space-y-5 mt-1">
          {/* Card do Cabeçalho da Rota com Ações de Edição/Exclusão */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="min-w-0 flex-1 text-left space-y-1">
              <h2 className="text-lg font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
                {vm.formData.nome || "Configurar Rota"}
              </h2>
              {(() => {
                const veiculo = vm.veiculosList.find((v) => v.id === vm.formData.veiculoId) || (vm.veiculosList.length === 1 ? vm.veiculosList[0] : null);
                return veiculo ? (
                  <p className="text-xs font-medium text-slate-400 leading-none">
                    {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-slate-400 leading-none">
                    Nenhum veículo associado
                  </p>
                );
              })()}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenEditRouteDialog}
                className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-500 hover:text-[#1a3a5c] hover:bg-slate-50 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
                title="Configurar Dados da Rota (Nome e Veículo)"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Configurar</span>
              </Button>

              {vm.isEditing && vm.id && vm.can("rotas.excluir") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={vm.handleDeleteRoute}
                  disabled={vm.isDeleting}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all"
                  title="Excluir Rota"
                >
                  {vm.isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <PontosDeAtencaoCollapse avisos={vm.avisosItinerario} />

          {/* Seção do Itinerário e Ações */}
          <div className="space-y-5 animate-in fade-in duration-300">
            <ConfigurarRotaItinerario
              itinerario={vm.itinerario}
              errosPorNo={vm.errosPorNo}
              listBottomRef={vm.listBottomRef}
              onToggleSentido={vm.handleToggleSentido}
              onMove={vm.handleMove}
              onRemove={vm.handleRemove}
              onInsertIntermediary={vm.openModalParadaIntermediaria}
              onOpenReordenarSheet={(item) => vm.setReordenarSheetTargetItem(item)}
              onOpenModalParadaGeral={vm.openModalParadaGeral}
            />

            <PontosDeAtencaoCollapse avisos={vm.avisosItinerario} />

            <Button
              type="submit"
              disabled={vm.isSaving || !vm.isFormValid}
              className="w-full h-12 bg-[#1a3a5c] hover:bg-[#16314f] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4 cursor-pointer"
            >
              {vm.isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Salvando Rota...</span>
                </>
              ) : (
                <span>{vm.isEditing ? "Salvar Alterações" : "Salvar"}</span>
              )}
            </Button>
          </div>
        </div>
      </form>

      <AdicionarParadaDialog
        isOpen={vm.isDialogOpen}
        onOpenChange={vm.setIsDialogOpen}
        insertTarget={vm.insertTarget}
        itinerario={vm.itinerario}
        passageirosList={vm.passageirosList}
        escolasList={vm.escolasList}
        selectedEscolaId={vm.filtroEscolaId}
        onSelectEscolaId={vm.setFiltroEscolaId}
        onAddPassageiro={vm.handleAddPassageiro}
        onOpenCadastrarEndereco={vm.handleOpenCadastrarEndereco}
        onAddEscola={vm.handleAddEscola}
      />

      {vm.editingInlinePassageiroId && (
        <PassageiroEnderecoFormDialog
          passageiroId={vm.editingInlinePassageiroId}
          nomePassageiro={vm.passageirosList.find((p) => p.id === vm.editingInlinePassageiroId)?.nome || ""}
          isOpen={!!vm.editingInlinePassageiroId}
          onSuccess={() => {
            vm.setEditingInlinePassageiroId(null);
            vm.setShouldAutoAddPassageiro(false);
            toast.success("Endereço adicionado!", {
              description: "Agora é só adicionar a parada do aluno ao itinerário.",
              duration: 3500,
            });
          }}
          onClose={() => {
            vm.setEditingInlinePassageiroId(null);
            vm.setShouldAutoAddPassageiro(false);
          }}
        />
      )}

      <ReordenarParadaSheet
        isOpen={vm.reordenarSheetTargetItem !== null}
        onClose={() => vm.setReordenarSheetTargetItem(null)}
        paradaTarget={vm.reordenarSheetTargetItem as any}
        totalPendentes={vm.itinerario as any}
        paradasConcluidas={[]}
        isConfigMode={true}
        execucaoTipo=""
        validarMovimentoPermitido={vm.validarMovimentoPermitido}
        onConfirmReordenação={(novasParadas) => vm.setItinerario(novasParadas as any)}
        escolasList={vm.escolasList}
      />
    </PullToRefreshWrapper>
  );
}
