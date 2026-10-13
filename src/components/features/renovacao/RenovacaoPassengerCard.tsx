import { memo, useState } from "react";
import {
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  ArrowRight,
  School,
  Pencil,
  Loader2,
} from "lucide-react";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { formatCurrency, formatShortName } from "@/utils/formatters";
import { formatDateToBR } from "@/utils/formatters/date";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { useNotificarLoteRenovacao } from "@/hooks/api/useRenovacoes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RenovacaoPassengerCardProps {
  item: RenovacaoPassageiroItem;
  anoDestino: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onConfirmarManual: (id: string) => Promise<void> | void;
  onRegistrarSaida: (id: string, nomeAluno: string) => void;
  onReativar: (id: string, nomeAluno: string, temContrato: boolean, contratoAssinado: boolean) => void;
  onOpenEditarReserva?: (item: RenovacaoPassageiroItem) => void;
  isUpdating?: boolean;
}

export const RenovacaoPassengerCard = memo(function RenovacaoPassengerCard({
  item,
  anoDestino,
  isSelected,
  onToggleSelect,
  onConfirmarManual,
  onRegistrarSaida,
  onReativar,
  onOpenEditarReserva,
  isUpdating,
}: RenovacaoPassengerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const notificarMutation = useNotificarLoteRenovacao();
  const [isSendingWaba, setIsSendingWaba] = useState(false);

  const isConfirmed = item.status === RenovacaoStatus.CONFIRMADO;
  const isRecusado = item.status === RenovacaoStatus.RECUSADO;
  const isPendente = item.status === RenovacaoStatus.PENDENTE || (item.status as string) === "nao_notificado" || !item.status;

  const isValorAlterado =
    item.novo_valor_cobranca !== null &&
    item.novo_valor_cobranca !== undefined &&
    item.valor_cobranca_atual !== null &&
    item.valor_cobranca_atual !== undefined &&
    item.novo_valor_cobranca !== item.valor_cobranca_atual;

  const isEscolaAlterada =
    item.nova_escola_id &&
    item.escola_id_atual &&
    item.nova_escola_id !== item.escola_id_atual;

  const isPeriodoAlterado =
    item.novo_periodo &&
    item.periodo_atual &&
    item.novo_periodo !== item.periodo_atual;

  const handleSetConfirmado = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmed || loadingAction) return;
    setLoadingAction("confirmar");
    try {
      await onConfirmarManual(item.passageiro_id);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSetSaida = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRecusado || loadingAction) return;
    onRegistrarSaida(item.passageiro_id, item.nome);
  };

  const handleSetPendente = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPendente || loadingAction) return;
    const temContrato = Boolean(item.contrato_status);
    const contratoAssinado = item.contrato_status === "assinado";
    onReativar(item.passageiro_id, item.nome, temContrato, contratoAssinado);
  };

  const handleDispararWaba = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tel = item.responsavel_principal?.telefone;
    if (!tel) {
      toast.error("Este aluno não possui telefone do responsável cadastrado.");
      return;
    }

    setIsSendingWaba(true);
    try {
      await notificarMutation.mutateAsync({
        anoDestino,
        passageiroIds: [item.passageiro_id],
      });
      toast.success(`Mensagem de renovação enviada para o responsável de ${item.nome}!`);
    } catch {
      toast.error("Erro ao enviar notificação pelo WhatsApp.");
    } finally {
      setIsSendingWaba(false);
    }
  };

  const handleReenviarWhatsAppManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tel = item.responsavel_principal?.telefone?.replace(/\D/g, "");
    if (!tel) {
      toast.error("Telefone não cadastrado.");
      return;
    }

    const shortName = formatShortName(item.nome, true);
    const linkProposta = `${window.location.origin}/renovacao/${item.token_publico || ""}`;
    const msg = `Olá! Segue o link com as condições de renovação do transporte escolar de ${shortName} para o ano letivo de ${anoDestino}: ${linkProposta}`;
    const url = `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const shortName = formatShortName(item.nome, true);
  const respName = item.responsavel_principal?.nome
    ? formatShortName(item.responsavel_principal.nome, true)
    : null;

  return (
    <div
      className={cn(
        "rounded-[20px] sm:rounded-[24px] border bg-[#ffffff] transition-all overflow-hidden shadow-xs",
        isSelected
          ? "border-primary/40 ring-1 ring-primary/20 bg-primary/[0.01]"
          : "border-[#e5e5e5] hover:border-[#737373]/30"
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3.5 sm:p-4 gap-2.5 sm:gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isUpdating}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(item.passageiro_id);
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Selecionar ${shortName}`}
            className="h-4 w-4 rounded-[4px] border-[#e5e5e5] text-[#0a0a0a] focus:ring-[#0a0a0a] cursor-pointer shrink-0"
          />

          {item.foto_url ? (
            <img
              src={item.foto_url}
              alt={shortName}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shrink-0 border border-[#e5e5e5]"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <User className="w-4 h-4 text-[#737373]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-[#0a0a0a] text-sm leading-tight truncate">
                {shortName}
              </h3>
              {(isValorAlterado || isEscolaAlterada || isPeriodoAlterado) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] bg-amber-50 text-amber-800 border border-amber-300/80 text-[10px] font-medium">
                  Ajustado
                </span>
              )}
              {item.contrato_status === "assinado" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] bg-emerald-50 text-emerald-800 border border-emerald-300/80 text-[10px] font-medium">
                  Contrato Assinado
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#737373] font-normal truncate mt-0.5">
              {respName && <span className="truncate">{respName}</span>}
              {item.escola_nome_atual && (
                <>
                  <span className="text-[#e5e5e5]">•</span>
                  <span className="truncate text-[#737373]">
                    {item.escola_nome_atual}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isConfirmed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] bg-emerald-50 text-emerald-800 border border-emerald-300/80 text-[11px] font-medium">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Confirmado</span>
            </span>
          )}

          {isRecusado && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] bg-rose-50 text-rose-800 border border-rose-300/80 text-[11px] font-medium">
              <X className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Saída</span>
            </span>
          )}

          {isPendente && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] bg-amber-50 text-amber-800 border border-amber-300/80 text-[11px] font-medium">
              <Clock className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Pendente</span>
            </span>
          )}

          <div className="w-6 h-6 rounded-[8px] flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#e5e5e5] p-3.5 sm:p-4 bg-[#fafafa] space-y-3">
          {(isEscolaAlterada || isPeriodoAlterado) && (
            <div className="flex flex-wrap gap-2">
              {isEscolaAlterada && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-[18px] bg-sky-50 text-sky-800 border border-sky-200">
                  <School className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-through text-[#e7000b]">{item.escola_nome_atual || "Antiga"}</span>
                  <ArrowRight className="w-3 h-3 text-[#737373] shrink-0" />
                  <span className="text-[#0a0a0a] font-semibold">{item.nova_escola_nome || "Nova escola"}</span>
                </span>
              )}
              {isPeriodoAlterado && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-[18px] bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-through text-[#e7000b]">{item.periodo_atual}</span>
                  <ArrowRight className="w-3 h-3 text-[#737373] shrink-0" />
                  <span className="text-[#0a0a0a] font-semibold">{item.novo_periodo}</span>
                </span>
              )}
            </div>
          )}

          <div
            onClick={() => onOpenEditarReserva?.(item)}
            className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-white hover:border-[#737373]/50 transition-all cursor-pointer shadow-none"
            title="Clique para editar valores e proposta da reserva"
          >
            <div>
              <span className="text-[11px] text-[#737373] font-normal block">
                Atual ({anoDestino - 1})
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] mt-0.5 block">
                {item.isento_atual ? "Isento" : formatCurrency(item.valor_cobranca_atual)}
              </span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#737373] shrink-0 mx-2" />

            <div className="text-right">
              <span className="text-[11px] text-[#737373] font-normal block">
                Nova Parcela ({anoDestino})
              </span>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                {isValorAlterado && (
                  <span className="text-xs font-normal line-through text-[#e7000b]">
                    {formatCurrency(item.valor_cobranca_atual)}
                  </span>
                )}
                <span
                  className={cn(
                    "text-xs sm:text-sm font-semibold block",
                    item.isento_atual
                      ? "text-[#737373]"
                      : isValorAlterado
                      ? "text-emerald-700"
                      : "text-[#0a0a0a]"
                  )}
                >
                  {item.isento_atual ? "Isento" : formatCurrency(item.novo_valor_cobranca)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {item.responsavel_principal?.telefone ? (
              item.notificacao_enviada_em ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReenviarWhatsAppManual}
                  className="rounded-[14px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium h-9 gap-1.5 shadow-none cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-600" />
                  <span className="truncate">Reenviar WhatsApp</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDispararWaba}
                  disabled={isSendingWaba}
                  className="rounded-[14px] border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-medium h-9 gap-1.5 shadow-none cursor-pointer disabled:opacity-40"
                >
                  {isSendingWaba ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  ) : (
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-600" />
                  )}
                  <span className="truncate">{isSendingWaba ? "Enviando..." : "Enviar WhatsApp"}</span>
                </Button>
              )
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="rounded-[14px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#737373] text-xs font-medium h-9 gap-1.5 opacity-60"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-[#737373]" />
                <span className="truncate">Sem WhatsApp</span>
              </Button>
            )}

            {onOpenEditarReserva && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditarReserva(item);
                }}
                className="rounded-[14px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium h-9 gap-1.5 shadow-none cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#737373]" />
                <span className="truncate">Editar Proposta</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 p-1 rounded-[16px] bg-[#f5f5f5] border border-[#e5e5e5] gap-1">
            <button
              type="button"
              onClick={handleSetSaida}
              disabled={loadingAction !== null}
              className={cn(
                "h-8 rounded-[12px] font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
                isRecusado
                  ? "bg-rose-50 text-rose-800 border border-rose-300/80 shadow-xs"
                  : "text-[#737373] hover:text-rose-700 hover:bg-white/60"
              )}
            >
              {loadingAction === "saida" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <X className="w-3 h-3 stroke-[2.5]" />
                  <span>Saída</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSetPendente}
              disabled={loadingAction !== null}
              className={cn(
                "h-8 rounded-[12px] font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
                isPendente
                  ? "bg-amber-50 text-amber-800 border border-amber-300/80 shadow-xs"
                  : "text-[#737373] hover:text-amber-800 hover:bg-white/60"
              )}
            >
              {loadingAction === "pendente" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                  <span>Pendente</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSetConfirmado}
              disabled={loadingAction !== null}
              className={cn(
                "h-8 rounded-[12px] font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
                isConfirmed
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-xs"
                  : "text-[#737373] hover:text-emerald-800 hover:bg-white/60"
              )}
            >
              {loadingAction === "confirmar" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Confirmado</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
