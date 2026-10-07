import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateNavigation } from "@/components/common/DateNavigation";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FretamentosToolbar } from "@/components/features/fretamento/FretamentosToolbar";
import { useLayout } from "@/contexts/LayoutContext";
import { useVeiculos, useSession, useProfile } from "@/hooks";
import { useFretamentoViewModel } from "@/hooks/ui/useFretamentoViewModel";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  Compass,
  Ticket,
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Phone,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FretamentoItemCalculado } from "@/hooks/business/useFretamentoCalculations";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";

export default function Fretamentos() {
  const navigate = useNavigate();
  const {
    openNovoFretamentoOuPasseioDialog,
    openFretamentoFormDialog,
    openPasseioFormDialog,
    openRegistrarPagamentoFretamentoDialog,
    openConfirmationDialog,
  } = useLayout();

  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { data: veiculosData } = useVeiculos({ usuarioId: profile?.id });
  const veiculos = veiculosData?.list || [];

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
    totais,
    isLoading,
    refetchList,
    excluirRegistro,
  } = useFretamentoViewModel();

  const handleOpenNovoRegistro = () => {
    openNovoFretamentoOuPasseioDialog({
      onSelectFretamento: () => {
        openFretamentoFormDialog({
          onSuccess: () => refetchList(),
        });
      },
      onSelectPasseio: () => {
        openPasseioFormDialog({
          onSuccess: () => refetchList(),
        });
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
        onSuccess: () => refetchList(),
      });
    } else {
      openPasseioFormDialog({
        editingItem: detalhesMock,
        onSuccess: () => refetchList(),
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
      onSuccess: () => refetchList(),
    });
  };

  const handleConfirmarExclusao = (item: FretamentoItemCalculado) => {
    openConfirmationDialog({
      title: "Excluir Registro",
      description: `Tem certeza que deseja excluir "${item.titulo}"? Esta ação não pode ser desfeita.`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await excluirRegistro(item.id, item.titulo);
      },
    });
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetchList(); }}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
        <DateNavigation
          mes={mes}
          ano={ano}
          onNavigate={(novoMes, novoAno) => {
            setMesAno(novoMes, novoAno);
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="order-2 md:order-1 w-full md:w-auto md:min-w-[280px]">
            <FinancialDashboardCard
              labelTotal="Total Previsto"
              labelRecebido="Já Recebido"
              labelPendente="A Receber"
              totalEsperado={totais.totalFaturado}
              recebido={totais.totalRecebido}
              pendente={totais.totalAReceber}
              loading={isLoading}
            />
          </div>

          <div className="order-1 md:order-2 w-full md:w-auto">
            <FretamentosToolbar
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
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
          </h2>
          {(() => {
            const sectionCount = itens.length;
            const countLabel = hasActiveFilters
              ? (sectionCount === 1 ? "ENCONTRADO" : "ENCONTRADOS")
              : (sectionCount === 1 ? "REGISTRADO" : "REGISTRADOS");
            return sectionCount != null ? (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {sectionCount} {countLabel}
              </span>
            ) : null;
          })()}
        </div>

        {itens.length === 0 && !isLoading && (
          <UnifiedEmptyState
            icon={Compass}
            title={
              hasActiveFilters
                ? "Nenhum frete ou passeio encontrado"
                : "Nenhum frete ou passeio registrado"
            }
            description={
              hasActiveFilters
                ? "Não encontramos viagens com os filtros selecionados."
                : "Cadastre suas viagens particulares, fretes fechados ou passeios escolares neste mês."
            }
            action={
              hasActiveFilters
                ? {
                    label: "Limpar Filtros",
                    onClick: clearFilters,
                  }
                : {
                    label: "Novo Registro",
                    onClick: handleOpenNovoRegistro,
                    icon: Plus,
                  }
            }
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itens.map((item) => {
            const isPasseio = item.tipo === "passeio";
            const dataFormatada = new Date(item.data_inicio).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          isPasseio
                            ? "bg-emerald-100 text-emerald-800 font-bold"
                            : "bg-[#1a3a5c]/10 text-[#1a3a5c] font-bold border border-[#1a3a5c]/20"
                        }
                      >
                        {isPasseio ? (
                          <Ticket className="h-3 w-3 mr-1" />
                        ) : (
                          <Compass className="h-3 w-3 mr-1" />
                        )}
                        {isPasseio ? "Passeio" : "Fretamento"}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={
                          item.isQuitado
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : item.total_pago > 0
                              ? "border-orange-300 text-orange-700 bg-orange-50"
                              : "border-slate-200 text-slate-600"
                        }
                      >
                        {item.isQuitado ? "Quitado" : item.total_pago > 0 ? "Sinal Pago" : "Pendente"}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isPasseio && !item.isQuitado && (
                          <DropdownMenuItem onClick={() => handleOpenRegistrarPagamento(item)}>
                            <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
                            Registrar Pagamento
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleOpenEditar(item)}>
                          <Edit className="h-4 w-4 mr-2 text-slate-500" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleConfirmarExclusao(item)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">{item.titulo}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{item.destino}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{dataFormatada}</span>
                    </div>

                    {isPasseio ? (
                      <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold">
                          {item.vagas_totais !== null ? `${item.vagas_ocupadas}/${item.vagas_totais} vagas` : `${item.vagas_ocupadas} inscritos`}
                        </span>
                      </div>
                    ) : item.contratante_nome ? (
                      <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.contratante_nome}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        {isPasseio ? "Arrecadado" : "Valor Pago"}
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(item.total_pago)} / {formatCurrency(Number(item.valor_total || 0))}
                      </span>
                    </div>
                    <Progress value={item.percentualPago} className="h-2 bg-slate-100" />
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                  {isPasseio ? (
                    <Button
                      onClick={() => navigate(`/fretamentos-e-passeios/${item.id}`)}
                      variant="outline"
                      className="w-full text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 justify-between h-9"
                    >
                      Gerenciar Vagas e Participantes
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Saldo: <strong className="text-slate-700">{formatCurrency(item.saldo_restante)}</strong>
                      </span>
                      {!item.isQuitado ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenRegistrarPagamento(item)}
                          className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          Registrar Pgto
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Totalmente Pago
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PullToRefreshWrapper>
  );
}
