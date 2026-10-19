import { useState, useMemo, useEffect, useRef } from "react";
import { useRenovacoesViewModel } from "@/hooks/ui/useRenovacoesViewModel";
import { useEscolasWithFilters, useProfile } from "@/hooks";
import { useLayout } from "@/contexts/LayoutContext";
import { RenovacaoKPICard } from "@/components/features/renovacao/RenovacaoKPICard";
import { RenovacaoContratoConfigCard } from "@/components/features/renovacao/RenovacaoContratoConfigCard";
import { RenovacaoPeriodoConfigCard } from "@/components/features/renovacao/RenovacaoPeriodoConfigCard";
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
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, HelpCircle, Clock, Settings2, ChevronDown } from "lucide-react";
import { STORAGE_KEYS } from "@/constants";
import { PassageiroResponsavel } from "@/types/passageiro";
import { Escola } from "@/types/escola";
import { useSEO } from "@/hooks/useSEO";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RenovacaoSkeleton } from "@/components/skeletons/RenovacaoSkeleton";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { getMonthNameBR } from "@/utils/dateUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { Banner } from "@/components/ui/Banner";

export default function Renovacoes() {
  useSEO({
    title: "Renovação de Ano Letivo",
    description: "Gerencie as reservas de vaga, reajustes e matrículas do próximo ano letivo da sua van.",
  });

  const { can } = usePermissions();
  const canManage = can("renovacoes.gerenciar");
  const isMobile = useIsMobile();

  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };
  const {
    openReajusteLoteDialog,
    openEditarReservaDialog,
    openConfirmarDisparoWabaDialog,
    openTutorialRenovacaoDialog,
    openConfigurarPeriodoAnoDialog,
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
    applyFilters,
    clearFilters,
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
    periodoConfig,
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

  const [isConfigOculto, setIsConfigOculto] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.RENOVACOES_CONFIG_OCULTO) === "true";
  });

  const handleToggleOcultarConfig = (ocultar: boolean) => {
    setIsConfigOculto(ocultar);
    try {
      localStorage.setItem(STORAGE_KEYS.RENOVACOES_CONFIG_OCULTO, String(ocultar));
    } catch { }
  };

  const isConfigVisivelNoMobile = !periodoConfig?.configurado || !isConfigOculto;

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
        toast.success(`Responsável de ${formatFirstName(item.nome)} atualizado com sucesso!`);
      },
    });
  };

  const handleConfirmarLoteComConfirmacao = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    openConfirmationDialog({
      title: `Confirmar vaga de ${count} ${count === 1 ? "aluno" : "alunos"}?`,
      description: `As vagas selecionadas serão confirmadas e matriculadas imediatamente no ano letivo de ${anoDestino}.`,
      confirmText: "Confirmar",
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
      confirmText: "Confirmar",
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
      confirmText: "Confirmar",
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

  const handleConfirmarManualComConfirmacao = (passageiroId: string) => {
    const p = passageiros.find((item) => item.passageiro_id === passageiroId);
    const nomeAluno = p?.nome || "o aluno";

    return new Promise<void>((resolve, reject) => {
      openConfirmationDialog({
        title: `Confirmar vaga de ${formatFirstName(nomeAluno)}?`,
        description: (
          <div className="space-y-3">
            <p>
              A vaga de <strong>{formatShortName(nomeAluno, true)}</strong> será confirmada para o ano letivo de <strong>{anoDestino}</strong> e a matrícula será gerada imediatamente.
            </p>
          </div>
        ),
        confirmText: "Confirmar Vaga",
        cancelText: "Voltar",
        variant: "success",
        onConfirm: async () => {
          try {
            await handleConfirmarManual(passageiroId);
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

  const handleRegistrarSaidaComConfirmacao = (passageiroId: string) => {
    const p = passageiros.find((item) => item.passageiro_id === passageiroId);
    const nomeAluno = p?.nome || "o aluno";
    const temContrato = Boolean(p?.contrato_status);
    const contratoAssinado = p?.contrato_status === "assinado";
    const eraConfirmado = p?.status === RenovacaoStatus.CONFIRMADO;

    return new Promise<void>((resolve, reject) => {
      openConfirmationDialog({
        title: `Registrar saída de ${formatFirstName(nomeAluno)}?`,
        description: (
          <div className="space-y-3">
            <p>
              Tem certeza que deseja marcar a vaga de <strong>{formatShortName(nomeAluno, true)}</strong> como não renovada para o ano letivo de <strong>{anoDestino}</strong>?
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
        confirmText: "Confirmar",
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
    const nomeAluno = nomeAlunoParam || p?.nome;
    const temContrato = Boolean(p?.contrato_status);
    const contratoAssinado = p?.contrato_status === "assinado";
    const eraConfirmado = p?.status === RenovacaoStatus.CONFIRMADO;

    return new Promise<void>((resolve, reject) => {
      openConfirmationDialog({
        title: `Redefinir ${formatFirstName(nomeAluno)} para Pendente?`,
        description: (
          <div className="space-y-3">
            <p>
              A vaga de <strong>{formatShortName(nomeAluno, true)}</strong> voltará para o status pendente para o ano letivo de <strong>{anoDestino}</strong>.
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
        confirmText: "Confirmar",
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

  const hasAutoOpenedPeriodoRef = useRef<number | null>(null);
  const hasAutoOpenedTutorialRef = useRef<boolean>(false);

  const handleOpenConfigurarPeriodo = () => {
    openConfigurarPeriodoAnoDialog({
      anoDestino,
      onSuccess: () => {
        const dismissed = localStorage.getItem(STORAGE_KEYS.GUIDE_RENOVACOES_DISMISSED);
        if (!dismissed) {
          openTutorialRenovacaoDialog({ anoDestino });
        }
      },
    });
  };

  useEffect(() => {
    if (!canManage || isLoading || !periodoConfig) return;

    if (!periodoConfig.configurado) {
      if (hasAutoOpenedPeriodoRef.current !== anoDestino) {
        hasAutoOpenedPeriodoRef.current = anoDestino;
        handleOpenConfigurarPeriodo();
      }
    } else {
      const alreadyDismissed = localStorage.getItem(STORAGE_KEYS.GUIDE_RENOVACOES_DISMISSED);
      if (!alreadyDismissed && !hasAutoOpenedTutorialRef.current) {
        hasAutoOpenedTutorialRef.current = true;
        openTutorialRenovacaoDialog({ anoDestino });
      }
    }
  }, [canManage, isLoading, periodoConfig, anoDestino, openConfigurarPeriodoAnoDialog, openTutorialRenovacaoDialog]);

  const formatPeriodoTexto = () => {
    if (
      !periodoConfig?.configurado ||
      !periodoConfig.mes_inicio_cobranca ||
      !periodoConfig.ano_inicio_cobranca ||
      !periodoConfig.mes_fim_cobranca ||
      !periodoConfig.ano_fim_cobranca
    ) {
      return "Não configurado";
    }
    const mesIni = getMonthNameBR(periodoConfig.mes_inicio_cobranca).slice(0, 3);
    const anoIni = String(periodoConfig.ano_inicio_cobranca).slice(-2);
    const mesFim = getMonthNameBR(periodoConfig.mes_fim_cobranca).slice(0, 3);
    const anoFim = String(periodoConfig.ano_fim_cobranca).slice(-2);
    return `${mesIni}/${anoIni} a ${mesFim}/${anoFim}`;
  };

  const qtdParcelasMestre = useMemo(() => {
    if (
      !periodoConfig?.configurado ||
      !periodoConfig.mes_inicio_cobranca ||
      !periodoConfig.ano_inicio_cobranca ||
      !periodoConfig.mes_fim_cobranca ||
      !periodoConfig.ano_fim_cobranca
    ) {
      return null;
    }
    const totalInicio = periodoConfig.ano_inicio_cobranca * 12 + periodoConfig.mes_inicio_cobranca;
    const totalFim = periodoConfig.ano_fim_cobranca * 12 + periodoConfig.mes_fim_cobranca;
    return totalFim >= totalInicio ? totalFim - totalInicio + 1 : null;
  }, [periodoConfig]);

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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => openTutorialRenovacaoDialog({ anoDestino })}
              className="h-10 px-2.5 sm:px-3 rounded-[16px] bg-white border border-[#e5e5e5] shadow-xs flex items-center justify-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors cursor-pointer shrink-0"
              title="Ajuda sobre a renovação"
            >
              <HelpCircle className="w-4 h-4 text-[#737373] shrink-0" />
              <span>Ajuda</span>
            </button>
          </div>

          <AnoLetivoSelect
            ano={anoDestino}
            onChangeAno={setAnoDestino}
            anosDisponiveis={anosDisponiveisRenovacao}
            renderLabel={(ano) => (
              <span className="text-xs font-bold text-[#0a0a0a] tracking-tight whitespace-nowrap">
                <span className="text-[#737373] font-medium hidden sm:inline">Renovação </span>
                <span>{ano - 1}</span>
                <span className="text-[#a3a3a3] mx-1 font-normal">→</span>
                <span>{ano}</span>
              </span>
            )}
            className="h-10 sm:h-11 shadow-xs shrink-0"
          />
        </div>

        {!periodoConfig?.configurado && (
          <Banner
            variant="warning"
            title={`Período de Cobrança de ${anoDestino} não configurado`}
            description="Defina os meses de início e término das cobranças para liberar a gestão e confirmações da renovação."
            action={{
              label: "Configurar Período Agora",
              onClick: handleOpenConfigurarPeriodo,
              className: "w-full sm:w-auto h-10 sm:h-9 text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-xs active:scale-95",
            }}
            className="border-amber-400/80 bg-amber-500/[0.12] dark:bg-amber-500/20 shadow-xs rounded-[20px] p-4"
          />
        )}

        <div className="relative space-y-5">
          {!periodoConfig?.configurado && !isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-white/80 backdrop-blur-xs rounded-[24px]">
              <div className="max-w-md w-full bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-[20px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a]">
                    Defina o Período de Cobrança
                  </h3>
                  <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                    Para liberar as confirmações e o gerenciamento da renovação de {anoDestino}, é necessário definir os meses de início e término das cobranças.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleOpenConfigurarPeriodo}
                    className="w-full h-11 rounded-[18px] font-semibold text-sm shadow-sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Configurar Período Agora
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={cn("space-y-5 transition-all duration-200", !periodoConfig?.configurado && "pointer-events-none select-none filter blur-xs")}>
            {!isMobile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
                <RenovacaoKPICard
                  kpis={kpis}
                  anoDestino={anoDestino}
                />

                <RenovacaoContratoConfigCard anoDestino={anoDestino} />

                <RenovacaoPeriodoConfigCard
                  anoDestino={anoDestino}
                  periodoTexto={formatPeriodoTexto()}
                  qtdParcelas={qtdParcelasMestre}
                  onConfigurar={handleOpenConfigurarPeriodo}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <RenovacaoKPICard
                  kpis={kpis}
                  anoDestino={anoDestino}
                />

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleToggleOcultarConfig(!isConfigOculto)}
                    className="w-full bg-[#ffffff] rounded-[20px] border border-[#e5e5e5] p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3 text-left hover:bg-[#fafafa] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                        <Settings2 className="w-4 h-4 text-[#0a0a0a]" />
                      </div>
                      <span className="font-semibold text-sm text-[#0a0a0a] truncate">
                        Configurações de Período e Contrato
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#737373] shrink-0">
                      <span className="font-medium">{isConfigOculto ? "Ver / Editar" : "Recolher"}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", !isConfigOculto && "rotate-180")} />
                    </div>
                  </button>

                  {isConfigVisivelNoMobile && (
                    <>
                      <RenovacaoContratoConfigCard anoDestino={anoDestino} />

                      <RenovacaoPeriodoConfigCard
                        anoDestino={anoDestino}
                        periodoTexto={formatPeriodoTexto()}
                        qtdParcelas={qtdParcelasMestre}
                        onConfigurar={handleOpenConfigurarPeriodo}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

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
                onApplyFilters={(filters) => {
                  applyFilters(filters);
                  setPage(1);
                }}
                onClearFilters={() => {
                  clearFilters();
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
                          className="hidden md:block text-xs font-normal text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
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
                          onConfirmarManual={handleConfirmarManualComConfirmacao}
                          onRegistrarSaida={handleRegistrarSaidaComConfirmacao}
                          onReativar={handleReativarComConfirmacao}
                          onOpenEditarReserva={(item) =>
                            openEditarReservaDialog({
                              passageiro: item,
                              anoDestino,
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
          </div>
        </div>

        {!isViewSemTelefone && periodoConfig?.configurado && (
          <RenovacaoStickyBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onDispararWhatsApp={handleOpenDisparoWhatsApp}
            onConfirmarLote={handleConfirmarLoteComConfirmacao}
            onSaidaLote={handleRegistrarSaidaLoteComConfirmacao}
            onPendenteLote={handleReativarLoteComConfirmacao}
            onOpenReajuste={() => openReajusteLoteDialog({ anoDestino, passageiroIds: Array.from(selectedIds) })}
            isProcessing={isUpdating}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
