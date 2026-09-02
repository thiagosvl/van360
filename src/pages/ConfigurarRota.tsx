import { useEffect } from "react";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RouteConfigSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { ConfigurarRotaItinerario } from "@/components/features/configurar-rota/ConfigurarRotaItinerario";
import { AdicionarParadaDialog } from "@/components/dialogs/AdicionarParadaDialog";
import PassageiroEnderecoFormDialog from "@/components/dialogs/PassageiroEnderecoFormDialog";
import { ReordenarParadaSheet } from "@/components/features/active-route/ReordenarParadaSheet";
import { useConfigurarRotaViewModel, ItineraryItem } from "@/hooks/ui/useConfigurarRotaViewModel";
import { useLayout } from "@/contexts/LayoutContext";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { toast } from "@/utils/notifications/toast";
import { formatShortName } from "@/utils/formatters";

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

  const renderAlertBlock = () => {
    if (vm.itinerario.length === 0 || (vm.errosItinerario.length === 0 && vm.avisosItinerario.length === 0)) return null;

    return (
      <div className="space-y-2 mb-4">
        {vm.errosItinerario.map((err, idx) => (
          <div key={`err-${idx}`} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold text-left">
            ⚠️ {err}
          </div>
        ))}
        {vm.avisosItinerario.map((aviso, idx) => (
          <div key={`aviso-${idx}`} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold text-left">
            ℹ️ {aviso}
          </div>
        ))}
      </div>
    );
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
                className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-500 hover:text-[#1a3a5c] hover:bg-slate-50 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all"
                title="Editar Nome/Veículo"
              >
                <Edit className="w-3.5 h-3.5" />
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

            {renderAlertBlock()}

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
        onAddPassageiro={vm.handleAddPassageiro}
        onAddEscola={vm.handleAddEscola}
      />

      {vm.editingInlinePassageiroId && (
        <PassageiroEnderecoFormDialog
          passageiroId={vm.editingInlinePassageiroId}
          nomePassageiro={vm.passageirosList.find((p) => p.id === vm.editingInlinePassageiroId)?.nome || ""}
          isOpen={!!vm.editingInlinePassageiroId}
          onSuccess={(addressData?: any) => {
            const targetId = vm.editingInlinePassageiroId;
            const isAutoAdd = vm.shouldAutoAddPassageiro;

            vm.setIsDialogOpen(false);
            vm.setEditingInlinePassageiroId(null);
            vm.setShouldAutoAddPassageiro(false);

            if (isAutoAdd && targetId) {
              const pass = vm.passageirosList.find((p) => p.id === targetId);
              const passName = pass?.nome || "Aluno";

              const updatedPass = pass ? {
                ...pass,
                responsavel_principal: {
                  ...pass.responsavel_principal,
                  nome: pass.responsavel_principal?.nome || "",
                  telefone: pass.responsavel_principal?.telefone || "",
                  logradouro: addressData?.logradouro || pass.responsavel_principal?.logradouro || "Endereço cadastrado",
                  numero: addressData?.numero || pass.responsavel_principal?.numero || "",
                  bairro: addressData?.bairro || pass.responsavel_principal?.bairro || "",
                  cidade: addressData?.cidade || pass.responsavel_principal?.cidade || "",
                  estado: addressData?.estado || pass.responsavel_principal?.estado || "",
                },
              } : null;

              const newItem: ItineraryItem = {
                id: `no-pass-${targetId}-${Date.now()}`,
                tipo_no: RouteNodeType.PASSAGEIRO,
                passageiro_id: targetId,
                nome: passName,
                detalhe: pass?.escola?.nome ? `Escola: ${pass.escola.nome}` : undefined,
                temEndereco: true,
                responsaveisAdicionais: (pass as any)?.responsaveis || [],
                passageiro: updatedPass,
                sentido: RouteSentido.INDO,
              };

              vm.setItinerario((prev) => [...prev, newItem]);
              toast.success(`Endereço salvo e ${formatShortName(passName, true)} adicionado(a) à rota!`);
            } else {
              toast.success("Endereço atualizado com sucesso!");
            }
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
