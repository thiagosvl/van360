import { BadgeDollarSign, Calendar, Edit3, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters";
import { formatMonthYearShort } from "@/utils/formatters/date";
import type { PublicRenovacaoResponse } from "@/types/renovacao";

interface PublicRenovacaoAlunoCardProps {
  passageiro: PublicRenovacaoResponse["passageiro"];
  responsavel?: PublicRenovacaoResponse["responsavel"];
  condicoes: PublicRenovacaoResponse["condicoes"];
  anoDestino: number;
  canEdit?: boolean;
  onEditarDados?: () => void;
}

export function PublicRenovacaoAlunoCard({
  passageiro,
  responsavel,
  condicoes,
  anoDestino,
  canEdit,
  onEditarDados,
}: PublicRenovacaoAlunoCardProps) {
  const temPeriodoCobranca = Boolean(condicoes.data_inicio_cobranca || condicoes.data_fim_cobranca);
  const temPeriodoTransporte = Boolean(condicoes.data_inicio_transporte || condicoes.data_fim_transporte);

  return (
    <article className="bg-white rounded-[24px] border border-border p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border font-semibold text-base">
            {passageiro.nome.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate mt-0.5">
              {passageiro.nome}
            </h2>
            {responsavel?.nome && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
                <span className="font-medium text-foreground">{responsavel.nome}</span>
              </p>
            )}
          </div>
        </div>

        {canEdit && onEditarDados && (
          <Button
            variant="tonal"
            size="sm"
            onClick={onEditarDados}
            className="w-full sm:w-auto h-9 px-3.5 text-xs font-medium gap-1.5 rounded-[18px] shrink-0 cursor-pointer justify-center"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Atualizar Dados</span>
          </Button>
        )}
      </div>

      <div className="bg-muted/30 rounded-[18px] p-4 border border-border space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border">
          <ShieldCheck className="w-4 h-4 text-foreground" />
          Valores e Condições
        </h3>

        <div className="divide-y divide-border/60 space-y-2.5">
          <div className="flex items-center justify-between pt-2.5 first:pt-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white text-foreground flex items-center justify-center shrink-0 border border-border">
                <BadgeDollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs text-muted-foreground font-normal">Valor</span>
            </div>

            <div className="text-right">
              {condicoes.valor.alterado ? (
                <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                  <span className="line-through text-destructive text-xs font-normal">
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

          <div className="flex items-center justify-between pt-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white text-foreground flex items-center justify-center shrink-0 border border-border">
                <ReceiptText className="w-4 h-4" />
              </div>
              <span className="text-xs text-muted-foreground font-normal">Parcelas</span>
            </div>

            <div className="text-right">
              <span className="font-semibold text-foreground text-xs sm:text-sm">
                {condicoes.qtd_parcelas
                  ? `${condicoes.qtd_parcelas} ${condicoes.qtd_parcelas === 1 ? "parcela" : "parcelas"}`
                  : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white text-foreground flex items-center justify-center shrink-0 border border-border">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs text-muted-foreground font-normal">Dia do Vencimento</span>
            </div>

            <div className="text-right">
              {condicoes.dia_vencimento.alterado ? (
                <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                  <span className="line-through text-destructive text-xs font-normal">
                    Dia {condicoes.dia_vencimento.atual}
                  </span>
                  <span className="text-foreground font-semibold text-xs sm:text-sm">
                    Dia {condicoes.dia_vencimento.novo}
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-foreground text-xs sm:text-sm">
                  Dia {condicoes.dia_vencimento.novo || 10}
                </span>
              )}
            </div>
          </div>

          {temPeriodoCobranca && (
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-white text-foreground flex items-center justify-center shrink-0 border border-border">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground font-normal">Período de Cobrança</span>
              </div>

              <div className="text-right text-xs font-semibold text-foreground">
                {condicoes.data_inicio_cobranca ? formatMonthYearShort(condicoes.data_inicio_cobranca) : ""}
                {" até "}
                {condicoes.data_fim_cobranca ? formatMonthYearShort(condicoes.data_fim_cobranca) : ""}
              </div>
            </div>
          )}

          {temPeriodoTransporte && (
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-white text-foreground flex items-center justify-center shrink-0 border border-border">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground font-normal">Período do Transporte</span>
              </div>

              <div className="text-right text-xs font-semibold text-foreground">
                {condicoes.data_inicio_transporte ? formatMonthYearShort(condicoes.data_inicio_transporte) : ""}
                {" até "}
                {condicoes.data_fim_transporte ? formatMonthYearShort(condicoes.data_fim_transporte) : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
