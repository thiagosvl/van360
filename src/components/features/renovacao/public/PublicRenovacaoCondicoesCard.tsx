import { BadgeDollarSign, Calendar, ShieldCheck, ReceiptText } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { formatMonthYearShort } from "@/utils/formatters/date";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoCondicoesCardProps {
  condicoes: PublicRenovacaoResponse["condicoes"];
  anoDestino: number;
}

export function PublicRenovacaoCondicoesCard({ condicoes, anoDestino }: PublicRenovacaoCondicoesCardProps) {
  const temPeriodoCobranca = Boolean(condicoes.data_inicio_cobranca || condicoes.data_fim_cobranca);
  const temPeriodoTransporte = Boolean(condicoes.data_inicio_transporte || condicoes.data_fim_transporte);

  return (
    <article className="bg-white rounded-[24px] border border-border p-5 sm:p-6 shadow-xs space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-foreground" />
        Valores e Condições
      </h3>

      <div className="divide-y divide-border space-y-3 pt-1">
        <div className="flex items-center justify-between pt-3 first:pt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <BadgeDollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Valor</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.valor.alterado ? (
              <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                <span className="line-through text-destructive text-xs sm:text-sm font-normal">
                  {formatCurrency(condicoes.valor.atual)}
                </span>
                <span className="text-foreground font-semibold text-sm sm:text-base">
                  {formatCurrency(condicoes.valor.novo)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-sm sm:text-base">
                {formatCurrency(condicoes.valor.novo)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Quantidade de Parcelas</span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-semibold text-foreground text-sm sm:text-base">
              {condicoes.qtd_parcelas ? `${condicoes.qtd_parcelas} parcelas` : "11 parcelas"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-normal block">Vencimento</span>
            </div>
          </div>

          <div className="text-right">
            {condicoes.dia_vencimento.alterado ? (
              <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                <span className="line-through text-destructive text-xs sm:text-sm font-normal">
                  Dia {condicoes.dia_vencimento.atual}
                </span>
                <span className="text-foreground font-semibold text-sm sm:text-base">
                  Dia {condicoes.dia_vencimento.novo}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground text-sm sm:text-base">
                Dia {condicoes.dia_vencimento.novo || 10}
              </span>
            )}
          </div>
        </div>

        {temPeriodoCobranca && (
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-normal block">Período de Cobrança</span>
              </div>
            </div>

            <div className="text-right text-xs sm:text-sm font-semibold text-foreground">
              {condicoes.data_inicio_cobranca ? formatMonthYearShort(condicoes.data_inicio_cobranca) : ""}
              {" até "}
              {condicoes.data_fim_cobranca ? formatMonthYearShort(condicoes.data_fim_cobranca) : ""}
            </div>
          </div>
        )}

        {temPeriodoTransporte && (
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-normal block">Período do Transporte</span>
              </div>
            </div>

            <div className="text-right text-xs sm:text-sm font-semibold text-foreground">
              {condicoes.data_inicio_transporte ? formatMonthYearShort(condicoes.data_inicio_transporte) : ""}
              {" até "}
              {condicoes.data_fim_transporte ? formatMonthYearShort(condicoes.data_fim_transporte) : ""}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
