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
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
      <CardHeader className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>DISTRIBUIÇÃO DE VENCIMENTOS DOS ALUNOS POR DIA</span>
            </CardTitle>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Agrupamento dos alunos ativos deste motorista conforme data de cobrança mensal
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-bold">{totalAtivosComVencimento}</span>
              <span className="text-[10px] text-slate-500">com vencimento</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
              <DollarSign className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-bold text-white">{formatCurrency(valorTotalGeral)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[10px] font-headline font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Dia do Mês</th>
                <th className="py-3 px-6 text-center">Alunos</th>
                <th className="py-3 px-6 text-right">Total Previsto</th>
                <th className="py-3 px-6">Distribuição Visual</th>
                <th className="py-3 px-6 text-right">Proporção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {dias.map((item) => {
                const isPico = diaComPico && diaComPico.quantidade > 0 && item.dia === diaComPico.dia;

                return (
                  <tr
                    key={item.dia}
                    className={`transition-colors ${
                      item.isHoje
                        ? "bg-blue-500/10 hover:bg-blue-500/15"
                        : "hover:bg-slate-900/60"
                    }`}
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          Dia {item.dia.toString().padStart(2, "0")}
                        </span>
                        {item.isHoje && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-sm shadow-blue-500/30">
                            <Clock className="h-2.5 w-2.5" />
                            Hoje
                          </span>
                        )}
                        {isPico && !item.isHoje && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Flame className="h-2.5 w-2.5" />
                            Pico
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-6 text-center">
                      <span
                        className={`font-mono font-black text-sm ${
                          item.isHoje ? "text-blue-400" : "text-white"
                        }`}
                      >
                        {item.quantidade}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold ml-1">
                        {item.quantidade === 1 ? "aluno" : "alunos"}
                      </span>
                    </td>

                    <td className="py-3 px-6 text-right font-mono font-bold text-slate-200">
                      {formatCurrency(item.valorTotal)}
                    </td>

                    <td className="py-3 px-6 min-w-[160px]">
                      <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            item.isHoje
                              ? "bg-blue-500 shadow-sm shadow-blue-500/50"
                              : isPico
                              ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                              : "bg-emerald-500/80"
                          }`}
                          style={{ width: `${Math.max(item.percentual, 4)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-6 text-right font-mono font-bold text-slate-300">
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
