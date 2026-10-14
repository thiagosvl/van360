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
import { RenovacaoSemTelefoneBanner } from "@/components/features/renovacao/RenovacaoSemTelefoneBanner";
import { RenovacaoStickyBar } from "@/components/features/renovacao/RenovacaoStickyBar";
import { PassageirosPagination } from "@/components/features/passageiro/PassageirosPagination";
import { AnoLetivoSelect } from "@/components/common/AnoLetivoSelect";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { Banner } from "@/components/ui/Banner";
import { Users, ArrowLeft, HelpCircle } from "lucide-react";
import { STORAGE_KEYS } from "@/constants";
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
import { cn } from "@/lib/utils";

export default function Renovacoes() {
  useSEO({
    title: "Renovação de Ano Letivo",
    description: "Gerencie as reservas de vaga, reajustes e matrículas do próximo ano letivo da sua van.",
  });

  const { can } = usePermissions();
  const canManage = can("renovacoes.gerenciar");

  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };
  const {
    openReajusteLoteDialog,
    openEditarReservaDialog,
    openConfirmarDisparoWabaDialog,
    openTutorialRenovacaoDialog,
    openResponsavelFormDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const {
    anoDestino,
    setAnoDestino,
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
    isFetching,
    hasData,
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
      description: `As vagas selecionadas serão confirmadas e matriculadas imediatamente no ano letivo de ${anoDestino}.`,
      confirmText: "Sim, Confirmar",
      cancelText: "Cancelar",
      variant: "success",
      onConfirm: async () => {
        try {
          await handleConfirmarLote();
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
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
            Tem certeza que deseja registrar a saída de <strong>{count} {count === 1 ? "aluno" : "alunos"}</strong> para o ano letivo de <strong>{anoDestino}</strong>? Caso já possuam matrícula confirmada em {anoDestino}, ela será removida.
          </p>
          {countContratos > 0 && (
            <Banner
              variant="warning"
              title="Cancelamento de Contratos Digitais"
              description={`${countContratos} ${countContratos === 1 ? "do aluno selecionado possui" : "dos alunos selecionados possuem"} contrato digital (${anoDestino}) gerado ou assinado. Ao registrar a saída em lote, esses documentos serão cancelados.`}
              className="rounded-[18px]"
            />
          )}
        </div>
      ),
      confirmText: "Sim, Registrar Saída",
      cancelText: "Voltar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await handleRegistrarSaidaLote();
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
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
            As vagas selecionadas voltarão para o status pendente para o ano letivo de <strong>{anoDestino}</strong> e eventuais matrículas já geradas em {anoDestino} serão removidas.
          </p>
          {countContratos > 0 && (
            <Banner
              variant="warning"
              title="Cancelamento de Contratos Digitais"
              description={`${countContratos} ${countContratos === 1 ? "do aluno selecionado possui" : "dos alunos selecionados possuem"} contrato digital (${anoDestino}) gerado ou assinado. Ao redefinir para pendente, esses documentos serão cancelados.`}
              className="rounded-[18px]"
            />
          )}
        </div>
      ),
      confirmText: "Sim, Redefinir para Pendente",
      cancelText: "Voltar",
      variant: "warning",
      onConfirm: async () => {
        try {
          await handleReativarLote();
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
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
    const eraConfirmado = p?.status === RenovacaoStatus.CONFIRMADO;

    return new Promise<void>((resolve, reject) => {
      openConfirmationDialog({
        title: `Registrar saída de ${nomeAluno}?`,
        description: (
          <div className="space-y-3">
            <p>
              Tem certeza que deseja marcar a vaga de <strong>{nomeAluno}</strong> como não renovada para o ano letivo de <strong>{anoDestino}</strong>?
              {eraConfirmado ? ` A matrícula de ${anoDestino} será removida.` : ""}
            </p>
            {temContrato && (
              <Banner
                variant="warning"
                title="Cancelamento de Contrato Digital"
                description={`Este aluno possui um contrato digital ${contratoAssinado ? "assinado" : "pendente"} para ${anoDestino}. Ao registrar a saída, esse documento será cancelado no sistema.`}
                className="rounded-[18px]"
              />
            )}
          </div>
        ),
        confirmText: "Sim, Registrar Saída",
        cancelText: "Voltar",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await handleRegistrarSaida(passageiroId);
            safeCloseDialog(closeConfirmationDialog);
            resolve();
          } catch (err) {
            safeCloseDialog(closeConfirmationDialog);
            reject(err);
          }
        },
        onCancel: () => {
          safeCloseDialog(closeConfirmationDialog);
          resolve();
        },
      });
    });
  };

  const handleReativarComConfirmacao = (passageiroId: string, nomeAlunoParam?: string) => {
    const p = passageiros.find((item) => item.passageiro_id === passageiroId);
    const nomeAluno = nomeAlunoParam || p?.nome || "o aluno";
    const temContrato = Boolean(p?.contrato_status);
    const contratoAssinado = p?.contrato_status === "assinado";
    const eraConfirmado = p?.status === RenovacaoStatus.CONFIRMADO;

    return new Promise<void>((resolve, reject) => {
      openConfirmationDialog({
        title: `Redefinir ${nomeAluno} para Pendente?`,
        description: (
          <div className="space-y-3">
            <p>
              A vaga de <strong>{nomeAluno}</strong> voltará para o status pendente para o ano letivo de <strong>{anoDestino}</strong>.
              {eraConfirmado ? ` A matrícula de ${anoDestino} será removida até nova confirmação.` : ""}
            </p>
            {temContrato && (
              <Banner
                variant="warning"
                title="Cancelamento de Contrato Digital"
                description={`Este aluno possui um contrato digital ${contratoAssinado ? "assinado" : "pendente"} para ${anoDestino}. Ao voltar para pendente, esse documento será cancelado e uma nova via precisará ser gerada caso a vaga seja confirmada novamente.`}
                className="rounded-[18px]"
              />
            )}
          </div>
        ),
        confirmText: "Sim, Redefinir para Pendente",
        cancelText: "Voltar",
        variant: "warning",
        onConfirm: async () => {
          try {
            await handleReativar(passageiroId);
            safeCloseDialog(closeConfirmationDialog);
            resolve();
          } catch (err) {
            safeCloseDialog(closeConfirmationDialog);
            reject(err);
          }
        },
        onCancel: () => {
          safeCloseDialog(closeConfirmationDialog);
          resolve();
        },
      });
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
      toast.info("Não há alunos selecionados ou pendentes para notificar.");
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
  }, [statusFilter, escolaFilter, periodoFilter, searchTerm, anoDestino, clearSelection]);

  useEffect(() => {
    if (!canManage || isLoading) return;
    const alreadyDismissed = localStorage.getItem(STORAGE_KEYS.GUIDE_RENOVACOES_DISMISSED);
    if (!alreadyDismissed) {
      localStorage.setItem(STORAGE_KEYS.GUIDE_RENOVACOES_DISMISSED, "true");
      openTutorialRenovacaoDialog({ anoDestino });
    }
  }, [canManage, isLoading, anoDestino, openTutorialRenovacaoDialog]);

  const totalPages = Math.ceil((passageiros.length || 0) / limit);

  const paginatedPassageiros = useMemo(() => {
    const from = (page - 1) * limit;
    return passageiros.slice(from, from + limit);
  }, [passageiros, page, limit]);

  const currentYear = new Date().getFullYear();
  const anosDisponiveisRenovacao = useMemo(
    () => [currentYear - 1, currentYear, currentYear + 1],
    [currentYear]
  );

  if (!canManage) {
    return <AccessRestrictedState moduleName="Renovação de Ano Letivo" />;
  }

  if (isLoading && !hasData) {
    return <RenovacaoSkeleton />;
  }

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="max-w-6xl mx-auto space-y-5 pb-24 sm:pb-28 pt-2 sm:pt-4">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-[#737373]">
              Origem {anoDestino - 1} → Destino {anoDestino}
            </span>
            <button
              type="button"
              onClick={() => openTutorialRenovacaoDialog({ anoDestino })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[14px] text-xs font-medium text-[#737373] hover:text-[#0a0a0a] bg-white hover:bg-[#fafafa] border border-[#e5e5e5] transition-colors cursor-pointer"
              title="Ver passo a passo de como funciona a renovação"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#737373]" />
              <span>Como funciona</span>
            </button>
          </div>
          <AnoLetivoSelect
            ano={anoDestino}
            onChangeAno={setAnoDestino}
            anosDisponiveis={anosDisponiveisRenovacao}
            label="Renovação"
            className="h-10 sm:h-11"
          />
        </div>

        <RenovacaoKPICard
          kpis={kpis}
          anoDestino={anoDestino}
        />

        <RenovacaoContratoConfigCard anoDestino={anoDestino} />

        <div className="space-y-2.5">
          <RenovacaoStatusPills
            kpis={kpis}
            activeStatus={statusFilter}
            semTelefoneCount={semTelefoneCount}
            isLoading={isFetching}
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

        <div className="space-y-3">
          {isViewSemTelefone ? (
            <div className="space-y-1 px-1">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(ALL_STATUS_FILTER);
                  setPage(1);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer group mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Voltar para Renovação</span>
              </button>
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
                  Alunos com Contato Pendente ({passageiros.length})
                </h4>
                <p className="text-xs text-[#737373] mt-0.5 font-normal">
                  Cadastre o telefone do responsável para habilitar a renovação.
                </p>
              </div>
            </div>
          ) : (
            <RenovacaoSemTelefoneBanner
              count={semTelefoneCount}
              onVerAlunos={() => {
                setStatusFilter(SEM_TELEFONE_FILTER);
                setPage(1);
              }}
            />
          )}

          {passageiros.length === 0 ? (
            <UnifiedEmptyState
              icon={Users}
              title={isViewSemTelefone ? "Nenhum aluno sem telefone" : "Nenhum aluno encontrado"}
              description={
                isViewSemTelefone
                  ? "Todos os alunos possuem responsáveis com telefone cadastrado e estão aptos para a renovação!"
                  : "Nenhum aluno corresponde aos filtros aplicados para este ano letivo."
              }
            />
          ) : (
            <>
              {!isViewSemTelefone && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-0.5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-[#0a0a0a] cursor-pointer select-none">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Marcar todos os alunos"
                        className="h-4 w-4 rounded-[5px] border-[#d4d4d4] data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white shrink-0 cursor-pointer"
                      />
                      <span>
                        {isAllSelected ? "Desmarcar todos" : `Marcar todos (${passageiros.length})`}
                      </span>
                    </label>

                    {pendentesAptosCount > 0 && (
                      <button
                        type="button"
                        onClick={selectOnlyPendentes}
                        className="text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-500/[0.08] hover:bg-amber-500/[0.15] border border-amber-500/20 px-2.5 py-0.5 rounded-[18px] transition-colors cursor-pointer"
                      >
                        Marcar pendentes ({pendentesAptosCount})
                      </button>
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs font-normal text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                    >
                      Limpar seleção ({selectedIds.size})
                    </button>
                  )}
                </div>
              )}

              <div className={cn("space-y-2.5 transition-opacity duration-150", isFetching && "opacity-60")}>
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
