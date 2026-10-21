import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { formatCurrency, formatDateToBR, formatDateTime } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/domain";
import type { FretamentoItemCalculado } from "@/hooks/business/useFretamentoCalculations";
import {
  Compass,
  Ticket,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Car,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Edit,
  CreditCard,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface FretamentoCardItemProps {
  item: FretamentoItemCalculado;
  onOpenRegistrarPagamento: (item: FretamentoItemCalculado) => void;
  onOpenEditar: (item: FretamentoItemCalculado) => void;
  onConfirmarExclusao: (item: FretamentoItemCalculado) => void;
  onConcluirStatus?: (item: FretamentoItemCalculado) => void;
  onReabrirStatus?: (item: FretamentoItemCalculado) => void;
  isDimmed?: boolean;
}

const formatarListaVeiculos = (veiculosList?: Array<{ placa?: string }>) => {
  if (!veiculosList || veiculosList.length === 0) return null;
  const placas = veiculosList.map((v) => formatarPlacaExibicao(v.placa)).filter(Boolean);
  if (placas.length === 0) return null;
  if (placas.length <= 2) return placas.join(", ");
  return `${placas.slice(0, 2).join(", ")} (+${placas.length - 2})`;
};

export const FretamentoCardItem = memo(function FretamentoCardItem({
  item,
  onOpenRegistrarPagamento,
  onOpenEditar,
  onConfirmarExclusao,
  onConcluirStatus,
  onReabrirStatus,
  isDimmed = false,
}: FretamentoCardItemProps) {
  const navigate = useNavigate();
  const isPasseio = item.tipo === "passeio";
  const dataFormatada = isPasseio ? formatDateTime(item.data_inicio) : formatDateToBR(item.data_inicio);

  const temSaldoPendentePassado = item.isPassado && !item.isQuitado && item.saldo_restante > 0;

  return (
    <div
      className={`bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-[#737373]/40 transition-all flex flex-col justify-between gap-3.5 ${
        isDimmed ? "opacity-85 hover:opacity-100" : ""
      }`}
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
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium border ${
                  item.status === "cancelado"
                    ? "bg-white text-[#e7000b] border-[#e7000b]/40"
                    : temSaldoPendentePassado
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : item.isConcluido || item.status === "concluido"
                        ? "bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]"
                        : item.isLotado
                          ? "bg-white text-[#e7000b] border-[#e7000b]/40"
                          : "bg-[#fafafa] text-[#0a0a0a] border-[#e5e5e5]"
                }`}
              >
                {item.status === "cancelado" ? (
                  "Cancelado"
                ) : temSaldoPendentePassado ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-amber-700" />
                    Realizado • Saldo Pendente
                  </>
                ) : item.isConcluido || item.status === "concluido" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-[#0a0a0a]" />
                    Concluído
                  </>
                ) : item.isLotado ? (
                  "Lotado"
                ) : (
                  <>
                    <Users className="h-3 w-3 text-[#737373]" />
                    Vagas Abertas
                  </>
                )}
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium border ${
                  item.status === "cancelado"
                    ? "bg-white text-[#e7000b] border-[#e7000b]/40"
                    : temSaldoPendentePassado
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : item.isQuitado
                        ? "bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]"
                        : item.total_pago > 0
                          ? "bg-[#fafafa] text-[#0a0a0a] border-[#e5e5e5]"
                          : "bg-white text-[#737373] border-[#e5e5e5]"
                }`}
              >
                {item.status === "cancelado" ? (
                  "Cancelado"
                ) : temSaldoPendentePassado ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-amber-700" />
                    Realizado • Saldo Pendente
                  </>
                ) : item.isQuitado ? (
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

          <ActionsDropdown
            title={item.titulo}
            description={item.destino}
            actions={[
              ...(!isPasseio && !item.isQuitado
                ? [
                    {
                      label: "Registrar Pagamento",
                      icon: <CreditCard className="h-4 w-4" />,
                      onClick: () => onOpenRegistrarPagamento(item),
                    },
                  ]
                : []),
              ...(item.status === "concluido"
                ? onReabrirStatus
                  ? [
                      {
                        label: isPasseio ? "Reabrir Passeio" : "Reabrir Viagem",
                        icon: <RotateCcw className="h-4 w-4" />,
                        onClick: () => onReabrirStatus(item),
                      },
                    ]
                  : []
                : onConcluirStatus
                  ? [
                      {
                        label: isPasseio ? "Concluir Passeio" : "Concluir Viagem",
                        icon: <CheckCircle2 className="h-4 w-4 text-[#0a0a0a]" />,
                        onClick: () => onConcluirStatus(item),
                      },
                    ]
                  : []),
              {
                label: "Editar",
                icon: <Edit className="h-4 w-4" />,
                onClick: () => onOpenEditar(item),
              },
              {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                variant: "destructive" as const,
                isDestructive: true,
                onClick: () => onConfirmarExclusao(item),
              },
            ]}
          />
        </div>

        <div>
          <h3 className="font-semibold text-[#0a0a0a] text-base leading-snug tracking-tight line-clamp-1">
            {item.titulo}
          </h3>
          {((isPasseio && item.destino) || (item.destino && item.destino !== item.titulo) || item.origem) && (
            <div className="flex items-center gap-1.5 text-xs text-[#737373] mt-1">
              <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0" />
              <span className="truncate">
                {item.origem && item.destino && item.destino !== item.titulo
                  ? `${item.origem} → ${item.destino}`
                  : item.destino || item.origem}
              </span>
            </div>
          )}
        </div>

        <div className="bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] p-2.5 sm:p-3 flex flex-col sm:flex-row justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#0a0a0a] min-w-0">
            <Calendar className="h-3.5 w-3.5 text-[#737373] shrink-0" />
            <span className="truncate font-medium">{dataFormatada}</span>
          </div>

          {isPasseio ? (
            <div className="flex items-center gap-2.5 text-[#0a0a0a] shrink-0">
              {item.veiculos && item.veiculos.length > 0 && (
                <div
                  className="flex items-center gap-1 text-[#737373]"
                  title={item.veiculos.map((v) => formatarPlacaExibicao(v.placa)).filter(Boolean).join(", ")}
                >
                  <Car className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium truncate max-w-[120px]">
                    {formatarListaVeiculos(item.veiculos)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[#0a0a0a]">
                <Users className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                <span className="font-medium">
                  {item.vagas_totais !== null ? `${item.vagas_ocupadas}/${item.vagas_totais} vagas` : `${item.vagas_ocupadas} inscritos`}
                </span>
              </div>
            </div>
          ) : item.veiculos && item.veiculos.length > 0 ? (
            <div
              className="flex items-center gap-1.5 text-[#0a0a0a] shrink-0 max-w-[60%]"
              title={item.veiculos.map((v) => formatarPlacaExibicao(v.placa)).filter(Boolean).join(", ")}
            >
              <Car className="h-3.5 w-3.5 text-[#737373] shrink-0" />
              <span className="truncate font-medium">
                {formatarListaVeiculos(item.veiculos)}
              </span>
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
                onClick={() => onOpenRegistrarPagamento(item)}
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
});
