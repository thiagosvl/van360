import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Settings, Trash2, Info, ChevronDown } from "lucide-react";
import { ROUTES } from "@/constants/routes";
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
    <div className="border border-sky-500/20 bg-sky-500/[0.08] rounded-[18px] overflow-hidden shadow-xs transition-all text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-sky-500/[0.12] transition-colors select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-[8px] bg-sky-500/15 flex items-center justify-center text-sky-700 shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-[#0a0a0a] truncate">
            {avisos.length === 1 ? "1 sugestão para sua rota" : `${avisos.length} sugestões para sua rota`}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-[#737373] transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-t border-sky-500/15 p-3.5 bg-white/50 space-y-2 animate-in fade-in duration-150">
          {avisos.map((aviso, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-[#171717] leading-relaxed font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
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
  const navigate = useNavigate();
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
      <form onSubmit={vm.handleSubmit} className="text-left pb-12 max-w-2xl mx-auto relative pt-1 sm:pt-2">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
              className="text-[#737373] hover:text-[#0a0a0a] hover:bg-white gap-1.5 -ml-2 font-medium text-xs h-8 sm:h-9 rounded-[18px] border border-transparent hover:border-[#e5e5e5] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>

          <div className="bg-white border border-[#e5e5e5] p-4 sm:p-5 rounded-[24px] shadow-xs flex items-center justify-between gap-4 transition-all">
            <div className="min-w-0 flex-1 text-left space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight leading-snug break-words">
                {vm.formData.nome || "Configurar Rota"}
              </h2>
              {(() => {
                const veiculo = vm.veiculosList.find((v) => v.id === vm.formData.veiculoId) || (vm.veiculosList.length === 1 ? vm.veiculosList[0] : null);
                return veiculo ? (
                  <p className="text-xs font-normal text-[#737373] leading-none">
                    {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                  </p>
                ) : (
                  <p className="text-xs font-normal text-[#737373] leading-none">
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
                className="h-8 px-3 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs shrink-0 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
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
                  className="h-8 px-2.5 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#e7000b]/10 text-[#737373] hover:text-[#e7000b] hover:border-[#e7000b]/20 font-medium text-xs shrink-0 cursor-pointer shadow-xs transition-all"
                  title="Excluir Rota"
                >
                  {vm.isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e7000b]" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <PontosDeAtencaoCollapse avisos={vm.avisosItinerario} />

          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
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

            <Button
              type="submit"
              disabled={vm.isSaving || !vm.isFormValid}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-[18px] shadow-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4 cursor-pointer border-none"
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
