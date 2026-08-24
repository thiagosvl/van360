import { useState } from "react";
import {
  Check,
  X,
  User,
  Pencil,
  Loader2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { formatCurrency, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RenovacaoPassengerCardProps {
  item: RenovacaoPassageiroItem;
  anoDestino: number;
  onConfirmarManual: (passageiroId: string) => Promise<void> | void;
  onRegistrarSaida: (passageiroId: string, nome: string) => Promise<void> | void;
  onReativar?: (passageiroId: string) => Promise<void> | void;
  onOpenEditarReserva?: (passageiro: RenovacaoPassageiroItem) => void;
  isUpdating?: boolean;
}

export function RenovacaoPassengerCard({
  item,
  anoDestino,
  onConfirmarManual,
  onRegistrarSaida,
  onReativar,
  onOpenEditarReserva,
}: RenovacaoPassengerCardProps) {
  const isConfirmed = item.status === RenovacaoStatus.CONFIRMADO;
  const isRecusado = item.status === RenovacaoStatus.RECUSADO;
  const isPendente = item.status === RenovacaoStatus.PENDENTE || (!isConfirmed && !isRecusado);

  const shortName = formatShortName(item.nome, true);
  const respName = formatNomeResponsavelExibicao(item.responsavel_principal?.nome);

  const [loadingAction, setLoadingAction] = useState<"confirmar" | "saida" | "pendente" | null>(null);

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = item.responsavel_principal?.telefone;
    if (!phone) return;

    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const token = item.token_publico;
    const link = token ? `https://app.van360.com.br/renovar/${token}` : "https://app.van360.com.br";

    const text = encodeURIComponent(
      `Olá ${respName || ""}! Estamos organizando as vagas do transporte escolar para ${anoDestino}. Para conferir as informações e garantir a vaga de ${shortName}, acesse o link: ${link}`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
  };

  const handleSetConfirmado = async () => {
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

  const handleSetSaida = async () => {
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

  const handleSetPendente = async () => {
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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm transition-all space-y-3">
      {/* HEADER DO CARD: Avatar + Nome + Responsável */}
      <div className="flex items-center gap-3 min-w-0">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={shortName}
            className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <User className="w-5 h-5 text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
            {shortName}
          </h3>
          {respName && (
            <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
              {respName}
            </p>
          )}
        </div>
      </div>

      {/* BLOCO DE PARCELAS: CLIQUE DIRETO PARA EDITAR PROPOSTA */}
      <div
        onClick={() => onOpenEditarReserva?.(item)}
        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 transition-colors cursor-pointer"
        title="Clique para editar valores e proposta da reserva"
      >
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Parcela Atual
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
            {item.isento_atual ? "Isento" : formatCurrency(item.valor_cobranca_atual)}
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-2" />

        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium block">
            Nova Parcela ({anoDestino})
          </span>
          <span
            className={cn(
              "text-sm sm:text-base font-bold mt-0.5 block",
              item.isento_atual ? "text-slate-700" : "text-emerald-700"
            )}
          >
            {item.isento_atual ? "Isento" : formatCurrency(item.novo_valor_cobranca)}
          </span>
        </div>
      </div>

      {/* AÇÕES SECUNDÁRIAS (WHATSAPP 50% | EDITAR 50%) */}
      <div className="grid grid-cols-2 gap-2">
        {item.responsavel_principal?.telefone ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenWhatsApp}
            className="w-full rounded-xl border-slate-300 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold h-10 gap-1.5 shadow-2xs cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
            <span>WhatsApp</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold h-10 gap-1.5 opacity-60"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current text-slate-400" />
            <span>Sem Telefone</span>
          </Button>
        )}

        {onOpenEditarReserva && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenEditarReserva(item)}
            className="w-full rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold h-10 gap-1.5 shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            <span>Editar</span>
          </Button>
        )}
      </div>

      {/* SELETOR SEGMENTADO DE 3 ESTADOS (OPÇÃO 1 - RESPONSIVO MOBILE-FIRST 320PX A DESKTOP) */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 gap-1">
        {/* ABA SAÍDA */}
        <button
          type="button"
          onClick={handleSetSaida}
          disabled={loadingAction !== null}
          className={cn(
            "h-9 sm:h-10 rounded-lg font-bold text-[10.5px] min-[360px]:text-xs sm:text-[13px] flex items-center justify-center gap-0.5 min-[360px]:gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer px-0.5 min-[360px]:px-2 sm:px-3",
            isRecusado
              ? "bg-rose-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-rose-700 hover:bg-white/60"
          )}
        >
          {loadingAction === "saida" ? (
            <Loader2 className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <>
              <X className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
              <span>Saída</span>
            </>
          )}
        </button>

        {/* ABA PENDENTE */}
        <button
          type="button"
          onClick={handleSetPendente}
          disabled={loadingAction !== null}
          className={cn(
            "h-9 sm:h-10 rounded-lg font-bold text-[10.5px] min-[360px]:text-xs sm:text-[13px] flex items-center justify-center gap-0.5 min-[360px]:gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer px-0.5 min-[360px]:px-2 sm:px-3",
            isPendente
              ? "bg-amber-500 text-white shadow-2xs"
              : "text-slate-600 hover:text-amber-700 hover:bg-white/60"
          )}
        >
          {loadingAction === "pendente" ? (
            <Loader2 className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <>
              <Clock className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
              <span>Pendente</span>
            </>
          )}
        </button>

        {/* ABA CONFIRMADO */}
        <button
          type="button"
          onClick={handleSetConfirmado}
          disabled={loadingAction !== null}
          className={cn(
            "h-9 sm:h-10 rounded-lg font-bold text-[10.5px] min-[360px]:text-xs sm:text-[13px] flex items-center justify-center gap-0.5 min-[360px]:gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer px-0.5 min-[360px]:px-2 sm:px-3",
            isConfirmed
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-emerald-700 hover:bg-white/60"
          )}
        >
          {loadingAction === "confirmar" ? (
            <Loader2 className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
              <span>Confirmado</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
