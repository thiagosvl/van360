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
  FileText,
} from "lucide-react";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { formatCurrency, formatFirstName } from "@/utils/formatters";
import { formatDateToBR } from "@/utils/formatters/date";
import { buildRenovacaoWhatsAppUrl } from "@/utils/whatsappTemplates";
import { openBrowserLink } from "@/utils/browser";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotificarLoteRenovacao } from "@/hooks/api/useRenovacoes";
import { useAppPreferences } from "@/hooks/business/useAppPreferences";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RenovacaoPassengerCardProps {
  item: RenovacaoPassageiroItem;
  anoDestino: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onConfirmarManual: (id: string) => Promise<void> | void;
  onRegistrarSaida: (id: string, nomeAluno: string) => Promise<void> | void;
  onReativar: (id: string, nomeAluno: string, temContrato: boolean, contratoAssinado: boolean) => Promise<void> | void;
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
  const { formatAlunoNome } = useAppPreferences();
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

  const isVencimentoAlterado =
    item.novo_dia_vencimento !== null &&
    item.novo_dia_vencimento !== undefined &&
    item.dia_vencimento_atual !== null &&
    item.dia_vencimento_atual !== undefined &&
    item.novo_dia_vencimento !== item.dia_vencimento_atual;

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

  const handleSetSaida = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRecusado || loadingAction) return;
    setLoadingAction("saida");
    try {
      await onRegistrarSaida(item.passageiro_id, item.nome);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSetPendente = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPendente || loadingAction) return;
    setLoadingAction("pendente");
    const temContrato = Boolean(item.contrato_status);
    const contratoAssinado = item.contrato_status === "assinado";
    try {
      await onReativar(item.passageiro_id, item.nome, temContrato, contratoAssinado);
    } finally {
      setLoadingAction(null);
    }
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
      toast.success(`Mensagem de renovação enviada para o responsável de ${formatFirstName(item.nome)}!`);
    } catch {
      toast.error("Erro ao enviar notificação pelo WhatsApp.");
    } finally {
      setIsSendingWaba(false);
    }
  };

  const handleReenviarWhatsAppManual = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tel = item.responsavel_principal?.telefone;
    if (!tel) {
      toast.error("Telefone não cadastrado.");
      return;
    }

    const linkProposta = `${window.location.origin}/renovacao/${item.token_publico || ""}`;
    const url = buildRenovacaoWhatsAppUrl({
      telefoneResponsavel: tel,
      nomeResponsavel: item.responsavel_principal?.nome,
      nomePassageiro: item.nome,
      anoDestino,
      link: linkProposta,
    });

    await openBrowserLink(url);
  };

  const alunoNome = formatAlunoNome(item.nome);
  const respName = item.responsavel_principal?.nome
    ? formatFirstName(item.responsavel_principal.nome)
    : null;

  return (
    <div
      className={cn(
        "rounded-[20px] sm:rounded-[24px] border transition-all overflow-hidden shadow-xs",
        isSelected
          ? "bg-blue-50/60 border-primary/40 ring-1 ring-primary/20"
          : "bg-white border-[#e5e5e5] hover:border-[#737373]/40"
      )}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3.5 sm:p-4 gap-2.5 sm:gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <Checkbox
            checked={isSelected}
            disabled={isUpdating}
            onCheckedChange={() => onToggleSelect(item.passageiro_id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Selecionar ${alunoNome}`}
            className="h-4 w-4 rounded-[5px] border-[#d4d4d4] data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white shrink-0 cursor-pointer"
          />

          {item.foto_url ? (
            <img
              src={item.foto_url}
              alt={alunoNome}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shrink-0 border border-[#e5e5e5]"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <User className="w-4 h-4 text-[#737373]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[#0a0a0a] text-sm leading-tight">
              {alunoNome}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[#737373] font-normal truncate mt-0.5">
              {respName && <span className="">{respName}</span>}
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
          {item.contrato_status === "assinado" && (
            <span title="Contrato Assinado" aria-label="Contrato Assinado">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            </span>
          )}
          {item.contrato_status === "pendente" && (
            <span title="Contrato Pendente" aria-label="Contrato Pendente">
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
            </span>
          )}

          {isConfirmed && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium" title="Confirmado">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Confirmado</span>
            </span>
          )}

          {isRecusado && (
            <span className="inline-flex items-center gap-1.5 text-[#e7000b] text-xs font-medium" title="Saída">
              <X className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Saída</span>
            </span>
          )}

          {isPendente && (
            <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium" title="Pendente">
              <Clock className="w-4 h-4 stroke-[2.5]" />
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
          <div
            onClick={() => onOpenEditarReserva?.(item)}
            className="rounded-[16px] border border-[#e5e5e5] bg-white p-3 space-y-2.5 hover:border-[#737373]/50 transition-all cursor-pointer shadow-none"
            title="Clique para editar valores e proposta da reserva"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] font-medium">
                Parcela {anoDestino}:
              </span>
              <div className="flex items-center gap-1.5 font-semibold">
                {item.isento_atual ? (
                  <span className="text-[#737373]">Isento</span>
                ) : isValorAlterado ? (
                  <>
                    <span className="line-through text-[#e7000b]">
                      {formatCurrency(item.valor_cobranca_atual)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                    <span className="text-emerald-700 text-sm">
                      {formatCurrency(item.novo_valor_cobranca)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#0a0a0a]">
                    {formatCurrency(item.novo_valor_cobranca)}
                  </span>
                )}
              </div>
            </div>

            {(isEscolaAlterada || isPeriodoAlterado || isVencimentoAlterado) && (
              <div className="pt-2 border-t border-[#f0f0f0] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {isEscolaAlterada && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#f9f9f9] px-2.5 py-1.5 rounded-[10px] min-w-0">
                    <span className="text-[#737373] text-[11px] font-medium shrink-0">
                      Escola:
                    </span>
                    <div className="flex items-center gap-1 min-w-0 truncate text-xs">
                      <span className="line-through text-[#e7000b] truncate" title={item.escola_nome_atual || "Antiga"}>
                        {item.escola_nome_atual || "Antiga"}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#737373] shrink-0" />
                      <span className="text-emerald-700 font-medium truncate" title={item.nova_escola_nome || "Nova escola"}>
                        {item.nova_escola_nome || "Nova escola"}
                      </span>
                    </div>
                  </div>
                )}

                {isPeriodoAlterado && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#f9f9f9] px-2.5 py-1.5 rounded-[10px]">
                    <span className="text-[#737373] text-[11px] font-medium shrink-0">
                      Turno:
                    </span>
                    <div className="flex items-center gap-1 text-xs capitalize">
                      <span className="line-through text-[#e7000b]">
                        {item.periodo_atual}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#737373] shrink-0" />
                      <span className="text-emerald-700 font-medium">
                        {item.novo_periodo}
                      </span>
                    </div>
                  </div>
                )}

                {isVencimentoAlterado && (
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#f9f9f9] px-2.5 py-1.5 rounded-[10px]">
                    <span className="text-[#737373] text-[11px] font-medium shrink-0">
                      Vencimento:
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="line-through text-[#e7000b]">
                        Dia {String(item.dia_vencimento_atual).padStart(2, "0")}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#737373] shrink-0" />
                      <span className="text-emerald-700 font-medium">
                        Dia {String(item.novo_dia_vencimento).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              {item.responsavel_principal?.telefone ? (
                item.notificacao_enviada_em ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleReenviarWhatsAppManual}
                    className="rounded-[14px] bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-medium text-xs h-9 px-3 gap-1.5 shadow-xs cursor-pointer w-full sm:w-auto justify-center transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-white shrink-0" />
                    <span className="truncate">Reenviar</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleDispararWaba}
                    disabled={isSendingWaba}
                    className="rounded-[14px] bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-medium text-xs h-9 px-3 gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 w-full sm:w-auto justify-center transition-all"
                  >
                    {isSendingWaba ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                    ) : (
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-white shrink-0" />
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
                  className="rounded-[14px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#737373] text-xs font-medium h-9 px-3 gap-1.5 opacity-60 w-full sm:w-auto justify-center"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-[#737373] shrink-0" />
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
                  className="rounded-[14px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium h-9 px-3 gap-1.5 shadow-none cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span>Editar</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:flex items-center p-1 rounded-[16px] bg-[#f5f5f5] border border-[#e5e5e5] gap-1 shrink-0">
              <button
                type="button"
                onClick={handleSetSaida}
                disabled={loadingAction !== null}
                className={cn(
                  "h-8 sm:px-3 rounded-[12px] font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
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
                  "h-8 sm:px-3 rounded-[12px] font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
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
                  "h-8 sm:px-3 rounded-[12px] font-medium text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
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
        </div>
      )}
    </div>
  );
});
