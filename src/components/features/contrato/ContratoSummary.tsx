import { cn } from "@/lib/utils";
import { ContratoStatus } from "@/types/enums";
import { formatCurrency, formatDateToBR, formatFirstName, formatShortName } from "@/utils/formatters";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { Calendar, Clock, FileCheck2, FileX2, User } from "lucide-react";

interface ContratoSummaryProps {
  item: any;
}

export const ContratoSummary = ({ item }: ContratoSummaryProps) => {
  const nomePassageiro = item.passageiro?.nome || item.nome || "Não informado";
  const nomeResponsavel = item.passageiro?.nome_responsavel || item.nome_responsavel;
  const status = item.status as ContratoStatus | null;
  const isSemContrato = item.tipo === "passageiro";
  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE;

  const valor =
    Number(item.dados_contrato?.valorMensal || item.valor_parcela || item.valor_mensal) || null;

  const dataAssinatura = isAssinado ? (item.data_assinatura || item.updated_at) : null;

  const badgeConfig = isSemContrato
    ? { label: formatContratoStatus(status), className: "bg-slate-50 text-slate-400" }
    : isAssinado
      ? { label: formatContratoStatus(status), className: "bg-emerald-50 text-emerald-600" }
      : isPendente
        ? { label: formatContratoStatus(status), className: "bg-amber-50 text-amber-600" }
        : null;

  return (
    <div className="flex flex-col gap-3 p-5 bg-white dark:bg-zinc-800/40 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">
      {/* Cabeçalho com ícone, nome e badge de status */}
      <div className="flex justify-between items-start mb-0.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-xl shrink-0",
              isAssinado
                ? "bg-emerald-50 border border-emerald-100"
                : isSemContrato
                  ? "bg-slate-50 border border-slate-100"
                  : "bg-amber-50 border border-amber-100"
            )}
          >
            {isAssinado ? (
              <FileCheck2 className="h-5 w-5 text-emerald-500" />
            ) : isSemContrato ? (
              <FileX2 className="h-5 w-5 text-slate-400" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
              Contrato
            </p>
            <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 leading-tight">
              {formatShortName(nomePassageiro, true)}
            </h1>
          </div>
        </div>

        {badgeConfig && (
          <span
            className={cn(
              "font-bold text-[8px] h-5 px-2 rounded-md flex items-center uppercase tracking-widest leading-none mt-1",
              badgeConfig.className
            )}
          >
            {badgeConfig.label}
          </span>
        )}
      </div>

      {/* Responsável */}
      {nomeResponsavel && (
        <div className="p-3 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50 flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              Responsável
            </p>
            <p className="text-xs text-slate-700 dark:text-zinc-300 font-bold leading-tight">
              {formatFirstName(nomeResponsavel)}
            </p>
          </div>
        </div>
      )}

      {/* Rodapé com valor e data de assinatura */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-zinc-800/50">
        {dataAssinatura ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                Assinado em
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                {formatDateToBR(dataAssinatura)}
              </p>
            </div>
          </div>
        ) : (
          <div />
        )}

        {valor ? (
          <p className="text-sm font-headline font-black text-[#1a3a5c] dark:text-zinc-100 leading-none">
            {formatCurrency(valor)}
            <span className="text-[9px] font-bold text-slate-400 ml-1">/mês</span>
          </p>
        ) : null}
      </div>
    </div>
  );
};
