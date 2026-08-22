import { useState } from "react";
import {
  Check,
  UserX,
  User,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { formatCurrency, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useUpdateRenovacao } from "@/hooks/api/useRenovacoes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RenovacaoPassengerCardProps {
  item: RenovacaoPassageiroItem;
  anoDestino: number;
  onConfirmarManual: (passageiroId: string) => Promise<void> | void;
  onRegistrarSaida: (passageiroId: string, nome: string) => Promise<void> | void;
  onOpenEditarReserva?: (passageiro: RenovacaoPassageiroItem) => void;
  isUpdating?: boolean;
}

type TipoAjusteRapido = "fixo" | "percentual" | "valor_direto";

export function RenovacaoPassengerCard({
  item,
  anoDestino,
  onConfirmarManual,
  onRegistrarSaida,
  onOpenEditarReserva,
  isUpdating = false,
}: RenovacaoPassengerCardProps) {
  const isConfirmed =
    item.status === RenovacaoStatus.CONFIRMADO_ONLINE ||
    item.status === RenovacaoStatus.CONFIRMADO_MANUAL;

  const isRecusado =
    item.status === RenovacaoStatus.RECUSADO_MOTORISTA ||
    item.status === RenovacaoStatus.RECUSADO_PAIS;

  const shortName = formatShortName(item.nome, true);
  const respName = formatNomeResponsavelExibicao(item.responsavel_principal?.nome);

  const [isExpanded, setIsExpanded] = useState(false);
  const [tipoAjuste, setTipoAjuste] = useState<TipoAjusteRapido>("fixo");
  const [valorAjuste, setValorAjuste] = useState("30,00");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRecusing, setIsRecusing] = useState(false);

  const updateMutation = useUpdateRenovacao();

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

  const handleConfirmar = async () => {
    if (isConfirming || isRecusing || isUpdating) return;
    setIsConfirming(true);
    try {
      await onConfirmarManual(item.passageiro_id);
      toast.success(`Vaga de ${shortName} confirmada!`);
    } catch {
      toast.error("Erro ao confirmar vaga.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRegistrarSaidaDireto = async () => {
    if (isConfirming || isRecusing || isUpdating) return;
    setIsRecusing(true);
    try {
      await onRegistrarSaida(item.passageiro_id, shortName);
      toast.success(`Saída de ${shortName} registrada!`);
    } catch {
      toast.error("Erro ao registrar saída.");
    } finally {
      setIsRecusing(false);
    }
  };

  const handleAplicarAjusteRapido = async () => {
    const base = Number(item.valor_cobranca_atual || 0);
    let novoValorCalculado = base;

    if (tipoAjuste === "fixo") {
      novoValorCalculado = base + moneyToNumber(valorAjuste);
    } else if (tipoAjuste === "percentual") {
      const perc = Number(valorAjuste.replace(",", "."));
      novoValorCalculado = base * (1 + perc / 100);
    } else {
      novoValorCalculado = moneyToNumber(valorAjuste);
    }

    novoValorCalculado = Math.max(0, Number(novoValorCalculado.toFixed(2)));

    try {
      await updateMutation.mutateAsync({
        passageiroId: item.passageiro_id,
        data: {
          ano_destino: anoDestino,
          novo_valor_cobranca: novoValorCalculado,
          novo_dia_vencimento: item.novo_dia_vencimento ?? item.dia_vencimento_atual ?? 10,
          nova_escola_id: item.nova_escola_id ?? item.escola_id_atual,
          novo_periodo: item.novo_periodo ?? item.periodo_atual,
          novo_veiculo_id: item.novo_veiculo_id ?? item.veiculo_id_atual,
          novo_isento: false,
        },
      });

      toast.success(`Mensalidade de ${shortName} ajustada para ${formatCurrency(novoValorCalculado)}`);
    } catch {
      toast.error("Erro ao aplicar ajuste de valor.");
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-3.5 sm:p-4 shadow-2xs transition-all space-y-2.5",
        isConfirmed && "border-emerald-200 bg-emerald-50/20",
        isRecusado && "border-rose-200 bg-rose-50/20",
        !isConfirmed && !isRecusado && "border-slate-200/90"
      )}
    >
      {/* LINHA 1: Avatar + Nome + Responsável (Esquerda) e Badge de Status (Direita) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="rounded-full bg-white p-[2px] shadow-sm shrink-0 flex items-center justify-center transition-all">
            <div className={cn(
              "rounded-full border flex items-center justify-center transition-colors",
              isConfirmed ? "border-emerald-500" : isRecusado ? "border-rose-400" : "border-[#1a3a5c]"
            )}>
              <div className="h-9 w-9 rounded-full border-[2px] border-white flex items-center justify-center bg-slate-200">
                <User className={cn(
                  "w-4 h-4 fill-current transition-colors",
                  isConfirmed ? "text-emerald-700" : isRecusado ? "text-rose-600" : "text-[#1a3a5c]/80"
                )} />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-headline font-bold text-[#1a3a5c] text-sm sm:text-base leading-tight truncate">
              {shortName}
            </p>

            {respName && (
              <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
                {respName}
              </p>
            )}
          </div>
        </div>

        {/* Badge de Status com Contraste Alto no Tema Light */}
        <div className="shrink-0">
          {isConfirmed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-bold border border-emerald-200/80">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              Confirmado
            </span>
          )}

          {!isConfirmed && !isRecusado && (
            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px] font-bold border border-amber-200/80">
              Pendente
            </span>
          )}

          {isRecusado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-[11px] font-bold border border-rose-200/80">
              <UserX className="w-3.5 h-3.5 text-rose-600" />
              Saída
            </span>
          )}
        </div>
      </div>

      {/* LINHA 2: Bloco de Mensalidade Compacto com Gatilho de Opções/Ajustes */}
      <div className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-2.5">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 divide-x divide-slate-200/80 flex-1 pr-2">
            <div className="pr-3">
              <span className="text-[11px] text-slate-400 font-medium leading-none block">
                Atual
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 mt-1 block">
                {item.isento_atual ? "Isento" : formatCurrency(item.valor_cobranca_atual)}
              </span>
            </div>

            <div className="pl-3">
              <span className="text-[11px] text-slate-400 font-medium leading-none block">
                Novo
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1a3a5c] mt-1 block">
                {item.novo_isento ? "Isento" : formatCurrency(item.novo_valor_cobranca)}
              </span>
            </div>
          </div>

          {/* Botão de Expandir Opções e Ajuste */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[#1a3a5c] text-xs font-bold transition-all shrink-0 active:scale-95 shadow-2xs cursor-pointer"
            title={isExpanded ? "Recolher opções" : "Mais opções e ajustes"}
          >
            <span>{isExpanded ? "Menos" : "Ajustar"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* BLOCO COLAPSÁVEL: Ações Secundárias e Painel de Reajuste Individual */}
      {isExpanded && (
        <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Ações 50% / 50% (WhatsApp e Editar Proposta) */}
          <div className="grid grid-cols-2 gap-2">
            {item.responsavel_principal?.telefone ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenWhatsApp}
                className="w-full rounded-xl border-slate-200 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold h-10 gap-1.5 shadow-2xs"
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
                className="w-full rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold h-10 gap-1.5 shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Editar Proposta</span>
              </Button>
            )}
          </div>

          {/* Painel Inline de Ajuste Rápido */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 space-y-2.5">
            <span className="text-slate-700 font-semibold ml-1 text-xs block">
              Reajustar Mensalidade Individual
            </span>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 min-w-[120px]">
                <Select
                  value={tipoAjuste}
                  onValueChange={(val) => {
                    const tipo = val as TipoAjusteRapido;
                    setTipoAjuste(tipo);
                    if (tipo === "percentual") setValorAjuste("8,0");
                    else if (tipo === "fixo") setValorAjuste("30,00");
                    else if (tipo === "valor_direto") setValorAjuste("380,00");
                  }}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-700 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixo">+ Reais (+ R$)</SelectItem>
                    <SelectItem value="percentual">+ Percentual (+ %)</SelectItem>
                    <SelectItem value="valor_direto">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 min-w-[100px]">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                <Input
                  value={valorAjuste}
                  onChange={(e) => {
                    if (tipoAjuste === "percentual") {
                      setValorAjuste(e.target.value.replace(/[^0-9,.]/g, ""));
                    } else {
                      setValorAjuste(moneyMask(e.target.value));
                    }
                  }}
                  placeholder={tipoAjuste === "percentual" ? "Ex: 8,0" : "R$ 0,00"}
                  className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-700 w-full"
                />
              </div>

              <Button
                type="button"
                onClick={handleAplicarAjusteRapido}
                disabled={updateMutation.isPending}
                className="h-10 px-4 rounded-xl bg-[#1a3a5c] hover:bg-[#142e4a] text-white text-xs font-bold shadow-2xs active:scale-95 transition-all shrink-0"
              >
                {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Aplicar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LINHA 3: Controle de Decisão Unificado (Não Renovar 50% | Confirmar 50%) com Contraste Ajustado */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Botão Não Renovar */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRegistrarSaidaDireto}
          disabled={isUpdating || isConfirming || isRecusing}
          className={cn(
            "rounded-xl font-bold text-xs h-10 gap-1.5 transition-all",
            isRecusado
              ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 shadow-2xs"
              : "border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 hover:border-rose-200"
          )}
        >
          {isRecusing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <UserX className="w-3.5 h-3.5 text-rose-600" />
              <span>{isRecusado ? "Não Renova" : "Não Renovar"}</span>
            </>
          )}
        </Button>

        {/* Botão Confirmar */}
        <Button
          type="button"
          size="sm"
          onClick={handleConfirmar}
          disabled={isUpdating || isConfirming || isRecusing}
          className={cn(
            "rounded-xl font-bold text-xs h-10 gap-1.5 transition-all shadow-2xs",
            isConfirmed
              ? "bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 cursor-default"
              : "border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 active:scale-95"
          )}
        >
          {isConfirming ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isConfirmed ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span>Confirmado</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
