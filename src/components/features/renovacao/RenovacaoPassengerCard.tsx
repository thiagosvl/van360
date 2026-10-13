import { useState, memo } from "react";
import {
  Check,
  X,
  User,
  Pencil,
  Loader2,
  ArrowRight,
  Clock,
  School,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { formatCurrency, formatDateToBR, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildRenovacaoWhatsAppUrl } from "@/utils/whatsappTemplates";
import { openBrowserLink } from "@/utils/browser";
import { useNotificarPassageiroRenovacao } from "@/hooks/api/useRenovacoes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RenovacaoPassengerCardProps {
  item: RenovacaoPassageiroItem;
  anoDestino: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onConfirmarManual: (passageiroId: string) => Promise<void> | void;
  onRegistrarSaida: (passageiroId: string, nome: string) => Promise<void> | void;
  onReativar?: (passageiroId: string, nome: string) => Promise<void> | void;
  onOpenEditarReserva?: (passageiro: RenovacaoPassageiroItem) => void;
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
}: RenovacaoPassengerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"confirmar" | "saida" | "pendente" | null>(null);

  const isConfirmed = item.status === RenovacaoStatus.CONFIRMADO;
  const isRecusado = item.status === RenovacaoStatus.RECUSADO;
  const isPendente = item.status === RenovacaoStatus.PENDENTE || (!isConfirmed && !isRecusado);

  const shortName = formatShortName(item.nome, true);
  const respName = formatNomeResponsavelExibicao(item.responsavel_principal?.nome);

  const { mutateAsync: notificarWaba, isPending: isSendingWaba } = useNotificarPassageiroRenovacao();

  const isValorAlterado = !item.isento_atual && item.novo_valor_cobranca !== item.valor_cobranca_atual;
  const isEscolaAlterada = Boolean(item.nova_escola_id && item.nova_escola_id !== item.escola_id_atual);
  const isPeriodoAlterado = Boolean(item.novo_periodo && item.novo_periodo !== item.periodo_atual);

  const handleDispararWaba = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificarWaba({
        passageiroId: item.passageiro_id,
        anoDestino,
      });
      toast.success(`WhatsApp de renovação enviado para os responsáveis de ${shortName}!`);
    } catch {
      toast.error(`Falha ao enviar WhatsApp para ${shortName}.`);
    }
  };

  const handleReenviarWhatsAppManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/renovacao/${item.token_publico}`;
    const url = buildRenovacaoWhatsAppUrl({
      telefoneResponsavel: item.responsavel_principal?.telefone,
      nomeResponsavel: item.responsavel_principal?.nome,
      nomePassageiro: item.nome,
      anoDestino,
      link,
    });
    openBrowserLink(url);
  };

  const handleSetConfirmado = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmed || loadingAction) return;
    setLoadingAction("confirmar");
    try {
      await onConfirmarManual(item.passageiro_id);
      toast.success(`Vaga de ${shortName} confirmada!`);
    } catch {
      toast.error("Erro ao confirmar vaga.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSetSaida = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRecusado || loadingAction) return;
    setLoadingAction("saida");
    try {
      await onRegistrarSaida(item.passageiro_id, shortName);
      toast.success(`Saída de ${shortName} registrada!`);
    } catch {
      toast.error("Erro ao registrar saída.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSetPendente = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPendente || loadingAction || !onReativar) return;
    onReativar(item.passageiro_id, shortName);
  };

  return (
    <div
      className={cn(
        "rounded-[20px] sm:rounded-[24px] border transition-all duration-200 overflow-hidden bg-white shadow-xs",
        isSelected
          ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
          : "border-[#e5e5e5] hover:border-[#737373]/50"
      )}
    >
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <label
            onClick={(e) => e.stopPropagation()}
            className="p-1 -m-1 cursor-pointer flex items-center justify-center shrink-0"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.passageiro_id)}
              className="h-4 w-4 rounded-[4px] border-[#e5e5e5] text-[#0a0a0a] focus:ring-[#0a0a0a] cursor-pointer"
            />
          </label>

          {item.foto_url ? (
            <img
              src={item.foto_url}
              alt={shortName}
              className="h-10 w-10 rounded-full object-cover shrink-0 border border-[#e5e5e5]"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <User className="w-5 h-5 text-[#737373]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-[#0a0a0a] text-sm sm:text-base leading-tight truncate">
                {shortName}
              </h3>
              {(isValorAlterado || isEscolaAlterada || isPeriodoAlterado) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] bg-amber-500/[0.08] text-amber-700 border border-amber-500/20 text-[10px] font-medium">
                  Condições Ajustadas
                </span>
              )}
              {item.contrato_status === "assinado" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] bg-emerald-500/[0.08] text-emerald-700 border border-emerald-500/20 text-[10px] font-medium">
                  Contrato Assinado
                </span>
              )}
              {item.contrato_status === "pendente" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] bg-sky-500/[0.08] text-sky-700 border border-sky-500/20 text-[10px] font-medium">
                  Contrato Pendente
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#737373] font-normal truncate mt-0.5">
              {respName && <span className="truncate">{respName}</span>}
              {item.escola_nome_atual && (
                <>
                  <span className="text-[#e5e5e5]">•</span>
                  <span className="truncate hidden min-[400px]:inline text-[#737373]">
                    {item.escola_nome_atual}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.notificacao_enviada_em ? (
            <span
              title={`Notificação enviada em ${formatDateToBR(item.notificacao_enviada_em)}`}
              className="hidden min-[480px]:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] bg-emerald-500/[0.08] text-emerald-700 border border-emerald-500/20"
            >
              <WhatsAppIcon className="w-3 h-3 fill-current text-emerald-600" />
              <span>Enviado ({formatDateToBR(item.notificacao_enviada_em)})</span>
            </span>
          ) : (
            <span
              title="Ainda não notificado"
              className="hidden min-[480px]:inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]"
            >
              Não notificado
            </span>
          )}

          {isConfirmed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[18px] bg-emerald-500/[0.08] text-emerald-700 border border-emerald-500/20 text-xs font-medium">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Confirmado</span>
            </span>
          )}

          {isRecusado && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[18px] bg-[#e7000b]/[0.08] text-[#e7000b] border border-[#e7000b]/20 text-xs font-medium">
              <X className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Saída</span>
            </span>
          )}

          {isPendente && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[18px] bg-amber-500/[0.08] text-amber-700 border border-amber-500/20 text-xs font-medium">
              <Clock className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Pendente</span>
            </span>
          )}

          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#e5e5e5] p-4 bg-[#fafafa] space-y-3.5">
          {(isEscolaAlterada || isPeriodoAlterado) && (
            <div className="flex flex-wrap gap-2">
              {isEscolaAlterada && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-[18px] bg-sky-500/[0.08] text-sky-700 border border-sky-500/20">
                  <School className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-through text-[#e7000b]">{item.escola_nome_atual || "Antiga"}</span>
                  <ArrowRight className="w-3 h-3 text-[#737373] shrink-0" />
                  <span className="text-[#0a0a0a] font-semibold">{item.nova_escola_nome || "Nova escola"}</span>
                </span>
              )}
              {isPeriodoAlterado && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-[18px] bg-amber-500/[0.08] text-amber-700 border border-amber-500/20 capitalize">
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
            className="flex items-center justify-between p-3.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:border-[#737373]/50 transition-all cursor-pointer shadow-none"
            title="Clique para editar valores e proposta da reserva"
          >
            <div>
              <span className="text-xs text-[#737373] font-normal block">
                Parcela Atual ({anoDestino - 1})
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#0a0a0a] mt-0.5 block">
                {item.isento_atual ? "Isento" : formatCurrency(item.valor_cobranca_atual)}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-[#737373] shrink-0 mx-2" />

            <div className="text-right">
              <span className="text-xs text-[#737373] font-normal block">
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
                    "text-sm sm:text-base font-semibold block",
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.responsavel_principal?.telefone ? (
              item.notificacao_enviada_em ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReenviarWhatsAppManual}
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium h-9 gap-1.5 shadow-none cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-600" />
                  <span>Reenviar pelo WhatsApp</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDispararWaba}
                  disabled={isSendingWaba}
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium h-9 gap-1.5 shadow-none cursor-pointer disabled:opacity-40"
                >
                  {isSendingWaba ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a0a0a]" />
                  ) : (
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-600" />
                  )}
                  <span>{isSendingWaba ? "Enviando..." : "Enviar WhatsApp"}</span>
                </Button>
              )
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="w-full rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#737373] text-xs font-medium h-9 gap-1.5 opacity-60"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-[#737373]" />
                <span>Sem WhatsApp</span>
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
                className="w-full rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium h-9 gap-1.5 shadow-none cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#737373]" />
                <span>Editar Proposta</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 p-1 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] gap-1">
            <button
              type="button"
              onClick={handleSetSaida}
              disabled={loadingAction !== null}
              className={cn(
                "h-8 sm:h-9 rounded-[14px] font-medium text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer",
                isRecusado
                  ? "bg-[#e7000b] text-white shadow-xs"
                  : "text-[#737373] hover:text-[#e7000b] hover:bg-white"
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
                "h-8 sm:h-9 rounded-[14px] font-medium text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer",
                isPendente
                  ? "bg-[#0a0a0a] text-white shadow-xs"
                  : "text-[#737373] hover:text-[#0a0a0a] hover:bg-white"
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
                "h-8 sm:h-9 rounded-[14px] font-medium text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer",
                isConfirmed
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[#737373] hover:text-emerald-700 hover:bg-white"
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
