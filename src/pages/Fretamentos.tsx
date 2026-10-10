import { useNavigate } from "react-router-dom";
import { DateNavigation } from "@/components/common/DateNavigation";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { Progress } from "@/components/ui/progress";
import { FretamentosToolbar } from "@/components/features/fretamento/FretamentosToolbar";
import { useLayout } from "@/contexts/LayoutContext";
import { useVeiculos, useSession, useProfile } from "@/hooks";
import { useFretamentoViewModel } from "@/hooks/ui/useFretamentoViewModel";
import { formatCurrency, formatDateToBR, formatDateTime } from "@/utils/formatters";
import {
  Compass,
  Ticket,
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Car,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit,
  CreditCard,
  Clock,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {itens.map((item) => {
            const isPasseio = item.tipo === "passeio";
            const dataFormatada = isPasseio ? formatDateTime(item.data_inicio) : formatDateToBR(item.data_inicio);

            return (
              <div
                key={item.id}
                className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-[#737373]/40 transition-all flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                        {isPasseio ? (
                          <Ticket className="h-3 w-3 text-[#737373]" />
                        ) : (
                          <Compass className="h-3 w-3 text-[#737373]" />
                        )}
                        {isPasseio ? "Passeio" : "Fretamento"}
                      </span>

                      {isPasseio ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium border ${item.isLotado
                              ? "bg-white text-[#e7000b] border-[#e7000b]/40"
                              : item.status === "concluido"
                                ? "bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]"
                                : item.status === "cancelado"
                                  ? "bg-white text-[#e7000b] border-[#e7000b]/40"
                                  : "bg-[#fafafa] text-[#0a0a0a] border-[#e5e5e5]"
                            }`}
                        >
                          {item.isLotado ? (
                            "Lotado"
                          ) : item.status === "concluido" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-[#0a0a0a]" />
                              Concluído
                            </>
                          ) : item.status === "cancelado" ? (
                            "Cancelado"
                          ) : (
                            <>
                              <Users className="h-3 w-3 text-[#737373]" />
                              Vagas Abertas
                            </>
                          )}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium border ${item.isQuitado
                              ? "bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]"
                              : item.total_pago > 0
                                ? "bg-[#fafafa] text-[#0a0a0a] border-[#e5e5e5]"
                                : "bg-white text-[#737373] border-[#e5e5e5]"
                            }`}
                        >
                          {item.isQuitado ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-[#0a0a0a]" />
                              Quitado
                            </>
                          ) : item.total_pago > 0 ? (
                            <>
                              <Clock className="h-3 w-3 text-[#737373]" />
                              Sinal Pago
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-[#737373]" />
                              Pendente
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[18px] border-[#e5e5e5] p-1.5">
                        {!isPasseio && !item.isQuitado && (
                          <DropdownMenuItem
                            onClick={() => handleOpenRegistrarPagamento(item)}
                            className="rounded-[10px] text-xs font-medium cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5 mr-2 text-[#737373]" />
                            Registrar Pagamento
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleOpenEditar(item)}
                          className="rounded-[10px] text-xs font-medium cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5 mr-2 text-[#737373]" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleConfirmarExclusao(item)}
                          className="rounded-[10px] text-xs font-medium text-[#e7000b] focus:text-[#e7000b] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#0a0a0a] text-base leading-snug tracking-tight line-clamp-1">
                      {item.titulo}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373] mt-1">
                      <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                      <span className="truncate">{item.destino}</span>
                    </div>
                  </div>

                  <div className="bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] p-2.5 sm:p-3 flex flex-col sm:flex-row justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#0a0a0a] min-w-0">
                      <Calendar className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                      <span className="truncate font-medium">{dataFormatada}</span>
                    </div>

                    {isPasseio ? (
                      <div className="flex items-center gap-1.5 text-[#0a0a0a] shrink-0">
                        <Users className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                        <span className="font-medium">
                          {item.vagas_totais !== null ? `${item.vagas_ocupadas}/${item.vagas_totais} vagas` : `${item.vagas_ocupadas} inscritos`}
                        </span>
                      </div>
                    ) : item.veiculos?.[0]?.placa ? (
                      <div className="flex items-center gap-1.5 text-[#0a0a0a] shrink-0">
                        <Car className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                        <span className="truncate font-medium">{item.veiculos[0].placa}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs">
                      <span className="text-[#737373] text-[11px] sm:text-xs">
                        {isPasseio ? "Arrecadado" : "Recebido"}
                      </span>
                      <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm">
                        {formatCurrency(item.total_pago)} <span className="text-[#737373] font-normal">de {formatCurrency(Number(item.valor_total || 0))}</span>
                      </span>
                    </div>
                    <Progress
                      value={item.percentualPago}
                      className="h-1.5 bg-[#f5f5f5]"
                      indicatorClassName={item.isQuitado ? "bg-emerald-600" : "bg-primary"}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#e5e5e5]">
                  {isPasseio ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-xs text-[#737373]">
                        {item.vagasRestantes !== null ? (
                          item.vagasRestantes === 0 ? (
                            <span className="text-[#e7000b] font-medium">Vagas esgotadas</span>
                          ) : (
                            <>
                              Restam <strong className="text-[#0a0a0a] font-semibold">{item.vagasRestantes} vagas</strong>
                            </>
                          )
                        ) : (
                          <>
                            <strong className="text-[#0a0a0a] font-semibold">{item.vagas_ocupadas}</strong> inscritos
                          </>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/fretamentos-e-passeios/${item.id}`)}
                        className="h-9 px-3.5 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs border-none shadow-xs transition-all active:scale-[0.98] gap-1.5 cursor-pointer shrink-0"
                      >
                        <Users className="h-3.5 w-3.5 text-primary-foreground" />
                        <span>Ver Participantes</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-0.5 text-primary-foreground/70" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="text-xs text-[#737373]">
                        A Receber: <strong className="text-[#0a0a0a] font-semibold">{formatCurrency(item.saldo_restante)}</strong>
                      </div>
                      {!item.isQuitado ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenRegistrarPagamento(item)}
                          className="h-9 px-3.5 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs border-none shadow-xs transition-all active:scale-[0.98] gap-1 cursor-pointer shrink-0"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Registrar Pagamento</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-[#0a0a0a] font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#0a0a0a]" />
                          Quitado
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
