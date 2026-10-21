import { useState, useEffect } from "react";
import { DateNavigation } from "@/components/common/DateNavigation";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { FretamentosToolbar } from "@/components/features/fretamento/FretamentosToolbar";
import { FretamentoCardItem } from "@/components/features/fretamento/FretamentoCardItem";
import { useLayout } from "@/contexts/LayoutContext";
import { useVeiculos, useSession, useProfile } from "@/hooks";
import { useFretamentoViewModel } from "@/hooks/ui/useFretamentoViewModel";
import { useAtualizarFretamentoMutation } from "@/hooks/api/useFretamentosApi";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";
import {
  Compass,
  Plus,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { FretamentoItemCalculado } from "@/hooks/business/useFretamentoCalculations";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";

export default function Fretamentos() {
  const {
    openNovoFretamentoOuPasseioDialog,
    openFretamentoFormDialog,
    openPasseioFormDialog,
    openRegistrarPagamentoFretamentoDialog,
    openConfirmationDialog,
    setPageTitle,
  } = useLayout();

  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id });
  const veiculos = veiculosData?.list || [];

  useEffect(() => {
    setPageTitle("Fretamentos e Passeios");
  }, [setPageTitle]);

  const {
    mes,
    ano,
    setMesAno,
    tipoFiltro,
    setTipoFiltro,
    statusFiltro,
    setStatusFiltro,
    veiculoFiltro,
    setVeiculoFiltro,
    hasActiveFilters,
    clearFilters,
    onApplyFilters,
    itens,
    itensAtivosEPendentes,
    itensConcluidos,
    totais,
    isLoading,
    refetchList,
    excluirRegistro,
  } = useFretamentoViewModel();

  const [concluidosExpandidosManual, setConcluidosExpandidosManual] = useState<boolean | null>(null);

  const isConcluidosAberto =
    concluidosExpandidosManual !== null
      ? concluidosExpandidosManual
      : itensAtivosEPendentes.length === 0;

  const handleOpenNovoRegistro = () => {
    openNovoFretamentoOuPasseioDialog({
      onSelectFretamento: () => {
        openFretamentoFormDialog();
      },
      onSelectPasseio: () => {
        openPasseioFormDialog();
      },
    });
  };

  const handleOpenEditar = (item: FretamentoItemCalculado) => {
    const detalhesMock: FretamentoDetalhes = {
      ...item,
      pagamentos: [],
      participantes: [],
    };

    if (item.tipo === "fretamento") {
      openFretamentoFormDialog({
        editingItem: detalhesMock,
      });
    } else {
      openPasseioFormDialog({
        editingItem: detalhesMock,
      });
    }
  };

  const handleOpenRegistrarPagamento = (item: FretamentoItemCalculado) => {
    const detalhesMock: FretamentoDetalhes = {
      ...item,
      pagamentos: [],
      participantes: [],
    };

    openRegistrarPagamentoFretamentoDialog({
      fretamento: detalhesMock,
    });
  };

  const handleConfirmarExclusao = (item: FretamentoItemCalculado) => {
    openConfirmationDialog({
      title: "Excluir Viagem",
      description: `Tem certeza que deseja excluir "${item.titulo}"? Esta ação não pode ser desfeita.`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await excluirRegistro(item.id, item.titulo);
      },
    });
  };

  const atualizarMutation = useAtualizarFretamentoMutation();

  const handleConfirmarConclusao = (item: FretamentoItemCalculado) => {
    const isPasseio = item.tipo === "passeio";
    const nomeTipo = isPasseio ? "Passeio" : "Viagem";
    const temSaldo = item.saldo_restante > 0;

    openConfirmationDialog({
      title: `Concluir ${nomeTipo}`,
      description: temSaldo
        ? `"${item.titulo}" ainda possui saldo pendente de recebimento (${formatCurrency(item.saldo_restante)}). Deseja marcar como concluído mesmo assim? O registro será movido para as viagens concluídas.`
        : `Deseja marcar "${item.titulo}" como concluído? O registro será movido para as viagens concluídas.`,
      confirmText: "Sim, concluir",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        try {
          await atualizarMutation.mutateAsync({
            id: item.id,
            payload: { status: "concluido" },
          });
          toast.success(`"${item.titulo}" marcado como concluído.`);
        } catch {
          toast.error("Erro ao atualizar status da viagem.");
        }
      },
    });
  };

  const handleConfirmarReabertura = (item: FretamentoItemCalculado) => {
    const isPasseio = item.tipo === "passeio";
    const nomeTipo = isPasseio ? "Passeio" : "Viagem";

    openConfirmationDialog({
      title: `Reabrir ${nomeTipo}`,
      description: `Deseja reabrir "${item.titulo}"? O registro retornará para a lista de viagens em andamento.`,
      confirmText: "Sim, reabrir",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        try {
          await atualizarMutation.mutateAsync({
            id: item.id,
            payload: { status: "confirmado" },
          });
          toast.success(`"${item.titulo}" reaberto com sucesso.`);
        } catch {
          toast.error("Erro ao reabrir viagem.");
        }
      },
    });
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetchList(); }}>
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 pt-1 sm:pt-2">
        <DateNavigation
          mes={mes}
          ano={ano}
          onNavigate={(novoMes, novoAno) => {
            setMesAno(novoMes, novoAno);
          }}
        />

        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e5e5]">
            <div className="sm:px-4 first:sm:pl-0 pb-3 sm:pb-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block">
                Total Previsto
              </span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight mt-0.5">
                {isLoading ? "..." : formatCurrency(totais.totalFaturado)}
              </div>
            </div>

            <div className="sm:px-4 py-3 sm:py-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block">
                Já Recebido
              </span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight mt-0.5">
                {isLoading ? "..." : formatCurrency(totais.totalRecebido)}
              </div>
            </div>

            <div className="sm:px-4 last:sm:pr-0 pt-3 sm:pt-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block">
                A Receber
              </span>
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight mt-0.5">
                {isLoading ? "..." : formatCurrency(totais.totalAReceber)}
              </div>
            </div>
          </div>
        </div>

        <FretamentosToolbar
          totalItens={itens.length}
          tipoFilter={tipoFiltro}
          onTipoChange={setTipoFiltro}
          statusFilter={statusFiltro}
          onStatusChange={setStatusFiltro}
          veiculoFilter={veiculoFiltro}
          onVeiculoChange={setVeiculoFiltro}
          onNovoRegistro={handleOpenNovoRegistro}
          veiculos={veiculos}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onApplyFilters={onApplyFilters}
          disabled={isLoading}
        />

        {itens.length === 0 && !isLoading && (
          <UnifiedEmptyState
            icon={Compass}
            title={
              hasActiveFilters
                ? "Nenhum frete ou passeio encontrado"
                : "Nenhum frete ou passeio cadastrado"
            }
            description={
              hasActiveFilters
                ? "Não encontramos viagens com os filtros selecionados."
                : "Cadastre viagens particulares, fretes fechados ou passeios escolares neste mês."
            }
            action={
              hasActiveFilters
                ? {
                  label: "Limpar Filtros",
                  onClick: clearFilters,
                }
                : {
                  label: "Nova Viagem",
                  onClick: handleOpenNovoRegistro,
                  icon: Plus,
                }
            }
          />
        )}

        {itensAtivosEPendentes.length > 0 && (
          <div className="space-y-3">
            {itensConcluidos.length > 0 && (
              <div className="flex items-center justify-between text-xs text-[#737373] px-1">
                <span className="font-semibold text-[#0a0a0a]">
                  Em Andamento & Próximas Viagens ({itensAtivosEPendentes.length})
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {itensAtivosEPendentes.map((item) => (
                <FretamentoCardItem
                  key={item.id}
                  item={item}
                  onOpenRegistrarPagamento={handleOpenRegistrarPagamento}
                  onOpenEditar={handleOpenEditar}
                  onConfirmarExclusao={handleConfirmarExclusao}
                  onConcluirStatus={handleConfirmarConclusao}
                  onReabrirStatus={handleConfirmarReabertura}
                />
              ))}
            </div>
          </div>
        )}

        {itensConcluidos.length > 0 && (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setConcluidosExpandidosManual(!isConcluidosAberto)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-[18px] bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] transition-all cursor-pointer group select-none text-left"
              aria-expanded={isConcluidosAberto}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#737373] group-hover:text-[#0a0a0a] transition-colors">
                  <CheckCheck className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Concluídas & Quitadas ({itensConcluidos.length})
                  </span>
                  <span className="text-[11px] text-[#737373] block truncate">
                    Viagens passadas 100% liquidadas neste mês
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-[#737373] group-hover:text-[#0a0a0a] shrink-0 pl-2">
                <span>{isConcluidosAberto ? "Ocultar" : "Mostrar"}</span>
                {isConcluidosAberto ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {isConcluidosAberto && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                {itensConcluidos.map((item) => (
                  <FretamentoCardItem
                    key={item.id}
                    item={item}
                    isDimmed
                    onOpenRegistrarPagamento={handleOpenRegistrarPagamento}
                    onOpenEditar={handleOpenEditar}
                    onConfirmarExclusao={handleConfirmarExclusao}
                    onConcluirStatus={handleConfirmarConclusao}
                    onReabrirStatus={handleConfirmarReabertura}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
