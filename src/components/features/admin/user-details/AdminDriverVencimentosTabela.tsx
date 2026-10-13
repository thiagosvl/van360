import { useMemo } from "react";
import { Calendar, Clock, Flame, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters/currency";
import type { AdminUserPassengerItem } from "@/services/api/admin/admin-user.api";

interface AdminDriverVencimentosTabelaProps {
  passageiros: AdminUserPassengerItem[];
}

interface DiaVencimentoItem {
  dia: number;
  quantidade: number;
  valorTotal: number;
  percentual: number;
  isHoje: boolean;
}

export function AdminDriverVencimentosTabela({ passageiros }: AdminDriverVencimentosTabelaProps) {
  const diaAtual = new Date().getDate();

  const { dias, totalAtivosComVencimento, valorTotalGeral, diaComPico } = useMemo(() => {
    const mapaDias = new Map<number, { quantidade: number; valorTotal: number }>();
    let totalQtd = 0;
    let totalValor = 0;

    for (const p of passageiros) {
      if (!p.ativo) continue;

      const dia = p.dia_vencimento ? Number(p.dia_vencimento) : null;
      if (!dia || dia < 1 || dia > 31) continue;

      const valor = Number(p.valor_cobranca ?? 0);
      const atual = mapaDias.get(dia) || { quantidade: 0, valorTotal: 0 };
      atual.quantidade += 1;
      atual.valorTotal += valor;
      mapaDias.set(dia, atual);

      totalQtd += 1;
      totalValor += valor;
    }

    const listaDias: DiaVencimentoItem[] = Array.from(mapaDias.entries())
      .map(([dia, dados]) => ({
        dia,
        quantidade: dados.quantidade,
        valorTotal: dados.valorTotal,
        percentual: totalQtd > 0 ? Math.round((dados.quantidade / totalQtd) * 1000) / 10 : 0,
        isHoje: dia === diaAtual,
      }))
      .sort((a, b) => {
        if (b.quantidade !== a.quantidade) {
          return b.quantidade - a.quantidade;
        }
        return a.dia - b.dia;
      });

    let pico: DiaVencimentoItem | null = null;
    if (listaDias.length > 0 && listaDias[0].quantidade > 0) {
      pico = listaDias[0];
    }

    return {
      dias: listaDias,
      totalAtivosComVencimento: totalQtd,
      valorTotalGeral: totalValor,
      diaComPico: pico,
    };
  }, [passageiros, diaAtual]);

  if (dias.length === 0) {
    return null;
  }

  return (
    <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card">
      <CardHeader className="p-6 pb-4 border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Distribuição de vencimentos por dia</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Agrupamento dos alunos ativos deste motorista conforme data de cobrança mensal
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-foreground">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold">{totalAtivosComVencimento}</span>
              <span className="text-[10px] text-muted-foreground">com vencimento</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold">{formatCurrency(valorTotalGeral)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-3 px-6">Dia do mês</th>
                <th className="py-3 px-6 text-center">Alunos</th>
                <th className="py-3 px-6 text-right">Total previsto</th>
                <th className="py-3 px-6">Distribuição visual</th>
                <th className="py-3 px-6 text-right">Proporção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {dias.map((item) => {
                const isPico = diaComPico && diaComPico.quantidade > 0 && item.dia === diaComPico.dia;

                return (
                  <tr
                    key={item.dia}
                    className={`transition-colors ${
                      item.isHoje
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          Dia {item.dia.toString().padStart(2, "0")}
                        </span>
                        {item.isHoje && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground shadow-sm">
                            <Clock className="h-2.5 w-2.5" />
                            Hoje
                          </span>
                        )}
                        {isPico && !item.isHoje && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            <Flame className="h-2.5 w-2.5" />
                            Pico
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-6 text-center">
                      <span
                        className={`font-mono font-bold text-sm ${
                          item.isHoje ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {item.quantidade}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium ml-1">
                        {item.quantidade === 1 ? "aluno" : "alunos"}
                      </span>
                    </td>

                    <td className="py-3 px-6 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(item.valorTotal)}
                    </td>

                    <td className="py-3 px-6 min-w-[160px]">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            item.isHoje
                              ? "bg-primary shadow-sm"
                              : isPico
                              ? "bg-amber-500 shadow-sm"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.max(item.percentual, 4)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-6 text-right font-mono font-medium text-muted-foreground">
                      {item.percentual}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
