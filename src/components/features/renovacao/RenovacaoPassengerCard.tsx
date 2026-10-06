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
  FileCheck,
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
  onReativar?: (passageiroId: string) => Promise<void> | void;
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

  const handleSetPendente = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPendente || loadingAction || !onReativar) return;
    setLoadingAction("pendente");
    try {
      await onReativar(item.passageiro_id);
      toast.success(`Reserva de ${shortName} redefinida para Pendente.`);
    } catch {
      toast.error("Erro ao redefinir status para pendente.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-hidden bg-white shadow-2xs",
        isSelected
          ? "border-blue-300 ring-2 ring-blue-100/80 bg-blue-50/20"
          : "border-slate-200/90 hover:border-slate-300"
      )}
    >
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <label
            onClick={(e) => e.stopPropagation()}
            className="p-1 -m-1 cursor-pointer flex items-center justify-center shrink-0"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.passageiro_id)}
              className="h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-md border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c] cursor-pointer"
            />
          </label>

          {item.foto_url ? (
            <img
              src={item.foto_url}
              alt={shortName}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shrink-0 border border-slate-200"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                {shortName}
              </h3>
              {(isValorAlterado || isEscolaAlterada || isPeriodoAlterado) && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-bold">
                  Condições Ajustadas
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal truncate mt-0.5">
              {respName && <span className="truncate">{respName}</span>}
              {item.escola_nome_atual && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="truncate hidden min-[400px]:inline text-slate-600 font-medium">
                    {item.escola_nome_atual}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {item.notificacao_enviada_em ? (
            <span
              title={`Notificação de renovação enviada em ${formatDateToBR(item.notificacao_enviada_em)}`}
              className="hidden min-[480px]:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60"
            >
              <WhatsAppIcon className="w-2.5 h-2.5 fill-current text-emerald-600" />
              <span>Enviado ({formatDateToBR(item.notificacao_enviada_em)})</span>
            </span>
          ) : (
            <span
              title="Ainda não notificado"
              className="hidden min-[480px]:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
            >
              Não notificado
            </span>
          )}

          {isConfirmed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Confirmado</span>
            </span>
          )}

          {isRecusado && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              <X className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Saída</span>
            </span>
          )}

          {isPendente && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <Clock className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Pendente</span>
            </span>
          )}

          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 p-3 sm:p-4 bg-slate-50/40 space-y-3 animate-in fade-in-50 duration-150">
          {(isEscolaAlterada || isPeriodoAlterado) && (
            <div className="flex flex-wrap gap-1.5">
              {isEscolaAlterada && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                  <School className="w-3 h-3 shrink-0" />
                  <span className="line-through text-rose-500">{item.escola_nome_atual || "Antiga"}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                  <span className="text-emerald-700 font-bold">{item.nova_escola_nome || "Nova escola"}</span>
                </span>
              )}
              {isPeriodoAlterado && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 capitalize">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="line-through text-rose-500">{item.periodo_atual}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="text-emerald-700 font-bold">{item.novo_periodo}</span>
                </span>
              )}
            </div>
          )}

          <div
            onClick={() => onOpenEditarReserva?.(item)}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer"
            title="Clique para editar valores e proposta da reserva"
          >
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Parcela Atual ({anoDestino - 1})
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
                {item.isento_atual ? "Isento" : formatCurrency(item.valor_cobranca_atual)}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-2" />

            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium block">
                Nova Parcela ({anoDestino})
              </span>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                {isValorAlterado && (
                  <span className="text-xs font-semibold line-through text-rose-500">
                    {formatCurrency(item.valor_cobranca_atual)}
                  </span>
                )}
                <span
                  className={cn(
                    "text-sm sm:text-base font-bold block",
                    item.isento_atual
                      ? "text-slate-700"
                      : isValorAlterado
                      ? "text-emerald-700"
                      : "text-slate-900"
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
                  className="w-full rounded-xl border-slate-300 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold h-9 gap-1.5 shadow-2xs cursor-pointer"
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
                  className="w-full rounded-xl border-slate-300 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold h-9 gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isSendingWaba ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
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
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold h-9 gap-1.5 opacity-60"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-slate-400" />
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
                className="w-full rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold h-9 gap-1.5 shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-600" />
                <span>Editar Proposta</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-200/60 border border-slate-200 gap-1">
            <button
              type="button"
              onClick={handleSetSaida}
              disabled={loadingAction !== null}
              className={cn(
                "h-8 sm:h-9 rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer",
                isRecusado
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-rose-700 hover:bg-white/70"
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
                "h-8 sm:h-9 rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer",
                isPendente
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-slate-600 hover:text-amber-700 hover:bg-white/70"
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
                "h-8 sm:h-9 rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer",
                isConfirmed
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-white/70"
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
