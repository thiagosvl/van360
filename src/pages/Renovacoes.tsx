import { useState, useMemo, useEffect } from "react";
import { useRenovacoesViewModel } from "@/hooks/ui/useRenovacoesViewModel";
import { useEscolasWithFilters, useProfile } from "@/hooks";
import { useLayout } from "@/contexts/LayoutContext";
import { RenovacaoKPICard } from "@/components/features/renovacao/RenovacaoKPICard";
import { RenovacaoContratoConfigCard } from "@/components/features/renovacao/RenovacaoContratoConfigCard";
import {
  RenovacaoStatusPills,
  ALL_STATUS_FILTER,
  SEM_TELEFONE_FILTER,
} from "@/components/features/renovacao/RenovacaoStatusPills";
import { RenovacaoToolbar } from "@/components/features/renovacao/RenovacaoToolbar";
import { RenovacaoPassengerCard } from "@/components/features/renovacao/RenovacaoPassengerCard";
import { RenovacaoSemTelefoneCard } from "@/components/features/renovacao/RenovacaoSemTelefoneCard";
import { RenovacaoStickyBar } from "@/components/features/renovacao/RenovacaoStickyBar";
import { PassageirosPagination } from "@/components/features/passageiro/PassageirosPagination";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { Rocket, Users, ArrowLeft } from "lucide-react";
import { PassageiroResponsavel } from "@/types/passageiro";
import { Escola } from "@/types/escola";
import { useSEO } from "@/hooks/useSEO";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RenovacaoSkeleton } from "@/components/skeletons/RenovacaoSkeleton";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "sonner";

export default function Renovacoes() {
  useSEO({
    title: "Renovação de Ano Letivo",
    description: "Gerencie as reservas de vaga, reajustes e virada de ano letivo da sua van.",
  });

  const { can } = usePermissions();
  const canManage = can("renovacoes.gerenciar");

  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };
  const {
    openReajusteLoteDialog,
    openEditarReservaDialog,
    openConfirmarViradaAnoDialog,
    openConfirmarDisparoWabaDialog,
    openResponsavelFormDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const {
    anoDestino,
    statusFilter,
    setStatusFilter,
    escolaFilter,
    setEscolaFilter,
    periodoFilter,
    setPeriodoFilter,
    searchTerm,
    setSearchTerm,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    selectOnlyPendentes,
    clearSelection,
    isAllSelected,
    kpis,
    passageiros,
    semTelefoneCount,
    pendentesAptosCount,
    isLoading,
    refetch,
    handleConfirmarManual,
    handleRegistrarSaida,
    handleReativar,
    handleConfirmarLote,
    handleRegistrarSaidaLote,
    handleReativarLote,
    isUpdating,
  } = useRenovacoesViewModel();

  const isViewSemTelefone = statusFilter === SEM_TELEFONE_FILTER;

  const handleCadastrarResponsavel = (item: RenovacaoPassageiroItem) => {
    openResponsavelFormDialog({
      passageiroId: item.passageiro_id,
      editingResponsavel: item.responsavel_principal?.id
        ? ({
            id: item.responsavel_principal.id,
            nome: item.responsavel_principal.nome || "",
            telefone: item.responsavel_principal.telefone || "",
            cpf: item.responsavel_principal.cpf || null,
            email: item.responsavel_principal.email || null,
          } as PassageiroResponsavel)
        : null,
      onSuccess: () => {
        refetch();
        toast.success(`Responsável de ${item.nome} atualizado com sucesso!`);
      },
    });
  };

  const handleConfirmarLoteComConfirmacao = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    openConfirmationDialog({
      title: `Confirmar vaga de ${count} ${count === 1 ? "aluno" : "alunos"}?`,
      description: `As vagas selecionadas serão marcadas como confirmadas para o ano letivo de ${anoDestino}.`,
      confirmText: "Sim, Confirmar",
      cancelText: "Cancelar",
      variant: "success",
      onConfirm: async () => {
        safeCloseDialog(closeConfirmationDialog);
        await handleConfirmarLote();
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleRegistrarSaidaLoteComConfirmacao = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const selecionadosComContrato = passageiros.filter(
      (p) => selectedIds.has(p.passageiro_id) && Boolean(p.contrato_status)
    );
    const countContratos = selecionadosComContrato.length;

    openConfirmationDialog({
      title: `Registrar saída de ${count} ${count === 1 ? "aluno" : "alunos"}?`,
      description: (
        <div className="space-y-3">
          <p>
            Tem certeza que deseja registrar a saída de <strong>{count} {count === 1 ? "aluno" : "alunos"}</strong> para o ano letivo de <strong>{anoDestino}</strong>? As vagas não serão renovadas.
          </p>
          {countContratos > 0 && (
            <Banner
              variant="warning"
              title="Cancelamento de Contratos Digitais"
              description={`${countContratos} ${countContratos === 1 ? "do aluno selecionado possui" : "dos alunos selecionados possuem"} contrato digital (${anoDestino}) gerado ou assinado. Ao registrar a saída em lote, esses documentos serão cancelados.`}
            />
          )}
        </div>
      ),
      confirmText: "Sim, Registrar Saída",
      cancelText: "Voltar",
      variant: "destructive",
      onConfirm: async () => {
        safeCloseDialog(closeConfirmationDialog);
        await handleRegistrarSaidaLote();
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleReativarLoteComConfirmacao = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const selecionadosComContrato = passageiros.filter(
      (p) => selectedIds.has(p.passageiro_id) && Boolean(p.contrato_status)
    );
    const countContratos = selecionadosComContrato.length;

    openConfirmationDialog({
      title: `Redefinir ${count} ${count === 1 ? "aluno" : "alunos"} para Pendente?`,
      description: (
        <div className="space-y-3">
          <p>
            As vagas selecionadas voltarão para o status pendente para o ano letivo de <strong>{anoDestino}</strong>.
          </p>
          {countContratos > 0 && (
            <Banner
              variant="warning"
              title="Cancelamento de Contratos Digitais"
              description={`${countContratos} ${countContratos === 1 ? "do aluno selecionado possui" : "dos alunos selecionados possuem"} contrato digital (${anoDestino}) gerado ou assinado. Ao redefinir para pendente, esses documentos serão cancelados.`}
            />
          )}
        </div>
      ),
      confirmText: "Sim, Redefinir para Pendente",
      cancelText: "Voltar",
      variant: "warning",
      onConfirm: async () => {
        safeCloseDialog(closeConfirmationDialog);
        await handleReativarLote();
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleRegistrarSaidaComConfirmacao = (passageiroId: string) => {
    const p = passageiros.find((item) => item.passageiro_id === passageiroId);
    const nomeAluno = p?.nome || "o aluno";
    const temContrato = Boolean(p?.contrato_status);
    const contratoAssinado = p?.contrato_status === "assinado";

    openConfirmationDialog({
      title: `Registrar saída de ${nomeAluno}?`,
      description: (
        <div className="space-y-3">
          <p>
            Tem certeza que deseja marcar a vaga de <strong>{nomeAluno}</strong> como não renovada para o ano letivo de <strong>{anoDestino}</strong>?
          </p>
          {temContrato && (
            <Banner
              variant="warning"
              title="Cancelamento de Contrato Digital"
              description={`Este aluno possui um contrato digital ${contratoAssinado ? "assinado" : "pendente"} para ${anoDestino}. Ao registrar a saída, esse documento será cancelado no sistema.`}
            />
          )}
        </div>
      ),
      confirmText: "Sim, Registrar Saída",
      cancelText: "Voltar",
      variant: "destructive",
      onConfirm: async () => {
        safeCloseDialog(closeConfirmationDialog);
        await handleRegistrarSaida(passageiroId);
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleReativarComConfirmacao = (passageiroId: string, nomeAlunoParam?: string) => {
    const p = passageiros.find((item) => item.passageiro_id === passageiroId);
    const nomeAluno = nomeAlunoParam || p?.nome || "o aluno";
    const temContrato = Boolean(p?.contrato_status);
    const contratoAssinado = p?.contrato_status === "assinado";

    openConfirmationDialog({
      title: `Redefinir ${nomeAluno} para Pendente?`,
      description: (
        <div className="space-y-3">
          <p>
            A vaga de <strong>{nomeAluno}</strong> voltará para o status pendente para o ano letivo de <strong>{anoDestino}</strong>.
          </p>
          {temContrato && (
            <Banner
              variant="warning"
              title="Cancelamento de Contrato Digital"
              description={`Este aluno possui um contrato digital ${contratoAssinado ? "assinado" : "pendente"} para ${anoDestino}. Ao voltar para pendente, esse documento será cancelado e uma nova via precisará ser gerada caso a vaga seja confirmada novamente.`}
            />
          )}
        </div>
      ),
      confirmText: "Sim, Redefinir para Pendente",
      cancelText: "Voltar",
      variant: "warning",
      onConfirm: async () => {
        safeCloseDialog(closeConfirmationDialog);
        await handleReativar(passageiroId);
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleOpenDisparoWhatsApp = () => {
    let listaParaEnviar: RenovacaoPassageiroItem[] = [];
    if (selectedIds.size > 0) {
      listaParaEnviar = passageiros.filter((p) => selectedIds.has(p.passageiro_id));
    } else {
      listaParaEnviar = passageiros.filter(
        (p) => p.status === RenovacaoStatus.PENDENTE || (p.status as string) === "nao_notificado" || !p.status
      );
    }

    if (listaParaEnviar.length === 0) {
      toast.info("Não há passageiros selecionados ou pendentes para notificar.");
      return;
    }

    openConfirmarDisparoWabaDialog({
      passageiros: listaParaEnviar,
      anoDestino,
      onSuccess: () => {
        clearSelection();
        refetch();
      },
    });
  };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setPage(1);
    clearSelection();
  }, [statusFilter, escolaFilter, periodoFilter, searchTerm, clearSelection]);

  const totalPages = Math.ceil((passageiros.length || 0) / limit);

  const paginatedPassageiros = useMemo(() => {
    const from = (page - 1) * limit;
    return passageiros.slice(from, from + limit);
  }, [passageiros, page, limit]);

  if (!canManage) {
    return <AccessRestrictedState moduleName="Renovação de Ano Letivo" />;
  }

  if (isLoading) {
    return <RenovacaoSkeleton />;
  }

  const handleOpenVirada = () => {
    openConfirmarViradaAnoDialog({
      anoDestino,
      kpis,
      onSuccess: () => refetch(),
      onRevisarPendentes: () => {
        setStatusFilter(RenovacaoStatus.PENDENTE);
        setPage(1);
      },
    });
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-5 pb-24 sm:pb-28">
        <RenovacaoKPICard
          kpis={kpis}
          anoDestino={anoDestino}
          onOpenViradaAno={handleOpenVirada}
        />

        <RenovacaoContratoConfigCard anoDestino={anoDestino} />

        <div className="space-y-2.5">
          <RenovacaoStatusPills
            kpis={kpis}
            activeStatus={statusFilter}
            semTelefoneCount={semTelefoneCount}
            onSelectStatus={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
          />

          <RenovacaoToolbar
            searchTerm={searchTerm}
            onSearchChange={(term) => {
              setSearchTerm(term);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusChange={(s) => {
              setStatusFilter(s);
              setPage(1);
            }}
            escolaFilter={escolaFilter}
            onEscolaChange={(e) => {
              setEscolaFilter(e);
              setPage(1);
            }}
            periodoFilter={periodoFilter}
            onPeriodoChange={(p) => {
              setPeriodoFilter(p);
              setPage(1);
            }}
            escolas={escolasList}
            onOpenReajusteLote={() => openReajusteLoteDialog({ anoDestino })}
            onNotificarLote={isViewSemTelefone ? undefined : handleOpenDisparoWhatsApp}
            isNotificandoLote={false}
            totalFiltrados={passageiros.length}
            pendentesCount={pendentesAptosCount}
          />
        </div>

        <div className="space-y-2.5">
          {isViewSemTelefone ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-orange-50/80 border border-orange-200">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-orange-950">
                  Alunos com Contato Pendente ({passageiros.length})
                </h4>
                <p className="text-xs text-orange-850 mt-0.5">
                  Cadastre ou atualize o telefone do responsável para habilitá-los na lista de renovação.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter(ALL_STATUS_FILTER);
                  setPage(1);
                }}
                className="h-8 px-3 rounded-xl border-orange-300 text-orange-900 bg-white hover:bg-orange-100 text-xs font-bold shrink-0 gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para Renovação</span>
              </Button>
            </div>
          ) : (
            semTelefoneCount > 0 && (
              <Banner
                variant="warning"
                title={`${semTelefoneCount} aluno(s) sem telefone cadastrado`}
                description="Eles não aparecem na lista de renovação abaixo até que o telefone seja informado."
                action={{
                  label: "Ver e Cadastrar Contatos",
                  onClick: () => {
                    setStatusFilter(SEM_TELEFONE_FILTER);
                    setPage(1);
                  },
                }}
              />
            )
          )}

          {passageiros.length === 0 ? (
            <UnifiedEmptyState
              icon={Users}
              title={isViewSemTelefone ? "Nenhum aluno sem telefone" : "Nenhum passageiro encontrado"}
              description={
                isViewSemTelefone
                  ? "Todos os alunos possuem responsáveis com telefone cadastrado e estão aptos para a renovação!"
                  : "Nenhum passageiro corresponde aos filtros aplicados para este ano letivo."
              }
            />
          ) : (
            <>
              {!isViewSemTelefone && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-0.5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded-md border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c] cursor-pointer"
                      />
                      <span>
                        {isAllSelected ? "Desmarcar todos" : `Marcar todos (${passageiros.length})`}
                      </span>
                    </label>

                    {pendentesAptosCount > 0 && (
                      <button
                        type="button"
                        onClick={selectOnlyPendentes}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        Marcar pendentes ({pendentesAptosCount})
                      </button>
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Limpar seleção ({selectedIds.size})
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {isViewSemTelefone
                  ? paginatedPassageiros.map((p) => (
                      <RenovacaoSemTelefoneCard
                        key={p.passageiro_id}
                        item={p}
                        onCadastrarResponsavel={handleCadastrarResponsavel}
                      />
                    ))
                  : paginatedPassageiros.map((p) => (
                      <RenovacaoPassengerCard
                        key={p.passageiro_id}
                        item={p}
                        anoDestino={anoDestino}
                        isSelected={selectedIds.has(p.passageiro_id)}
                        onToggleSelect={toggleSelect}
                        onConfirmarManual={handleConfirmarManual}
                        onRegistrarSaida={handleRegistrarSaidaComConfirmacao}
                        onReativar={handleReativarComConfirmacao}
                        onOpenEditarReserva={(item) =>
                          openEditarReservaDialog({
                            passageiro: item,
                            anoDestino,
                            onSuccess: () => refetch(),
                          })
                        }
                        isUpdating={isUpdating}
                      />
                    ))}
              </div>

              <PassageirosPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={passageiros.length}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                options={[20, 50, 100, 250, 500, 1000, 5000]}
                className="mt-4"
              />

              {!isViewSemTelefone && (
                <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Transição para o Ano Letivo {anoDestino}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {kpis.contadores.confirmados > 0
                        ? `${kpis.contadores.confirmados} passageiro(s) confirmado(s) prontos para virada.`
                        : "Confirme os passageiros que continuarão no transporte para aplicar a virada."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleOpenVirada}
                    disabled={isLoading || kpis.contadores.confirmados === 0}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-[#142e4a] to-[#1a3a5c] hover:from-[#0d1e30] hover:to-[#142e4a] text-white font-bold text-xs sm:text-sm shadow-sm gap-2 transition-all active:scale-[0.99] cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-4 h-4 text-amber-400" />
                    <span>Iniciar Ano Letivo {anoDestino} (Aplicar Virada)</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {!isViewSemTelefone && (
          <RenovacaoStickyBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onDispararWhatsApp={handleOpenDisparoWhatsApp}
            onConfirmarLote={handleConfirmarLoteComConfirmacao}
            onSaidaLote={handleRegistrarSaidaLoteComConfirmacao}
            onPendenteLote={handleReativarLoteComConfirmacao}
            onOpenReajuste={() => openReajusteLoteDialog({ anoDestino })}
            isProcessing={isUpdating}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
