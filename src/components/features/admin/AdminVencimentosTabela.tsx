import {
  Calendar,
  Users,
  Flame,
  Clock,
  RotateCw,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { useAdminVencimentosViewModel } from "@/hooks/ui/admin/useAdminVencimentosViewModel";

export function AdminVencimentosTabela() {
  const {
    isLoading,
    isError,
    refetch,
    somenteComVencimento,
    setSomenteComVencimento,
    buscaDia,
    setBuscaDia,
    dias,
    totalPassageiros,
    vencimentosHoje,
    diaComPico,
    diaAtual,
  } = useAdminVencimentosViewModel();

  if (isError) {
    return (
      <Card className="border border-rose-500/30 bg-rose-500/5 rounded-[2rem] p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400" />
          <p className="text-sm font-bold text-rose-300">Erro ao carregar vencimentos por dia.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
          >
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIS DE VENCIMENTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <AdminKpiCard
          title="VENCIMENTOS HOJE"
          value={vencimentosHoje}
          subtext={`Dia ${diaAtual} do mês`}
          cardBorder="border-blue-500/40 shadow-blue-500/10"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          icon={<Clock className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="BASE COM VENCIMENTO"
          value={totalPassageiros}
          subtext="Passageiros ativos de motoristas ativos"
          cardBorder="border-emerald-500/40 shadow-emerald-500/10"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<Users className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="DIA DE MAIOR VOLUME"
          value={diaComPico ? `Dia ${diaComPico.dia}` : "-"}
          subtext={diaComPico ? `${diaComPico.quantidade} passageiros com vencimento` : "Sem dados"}
          cardBorder="border-amber-500/40 shadow-amber-500/10"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<Flame className="h-5 w-5" />}
        />
      </div>

      {/* TABELA DE DISTRIBUIÇÃO */}
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="p-6 pb-4 border-b border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>DISTRIBUIÇÃO DE VENCIMENTOS DOS PASSAGEIROS POR DIA</span>
              </CardTitle>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Acompanhamento geral de vencimentos dos alunos ativos de motoristas em atividade operacional
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* BUSCA POR DIA */}
              <div className="relative w-32">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Dia..."
                  value={buscaDia}
                  onChange={(e) => setBuscaDia(e.target.value)}
                  className="h-8 pl-8 pr-2 text-xs bg-slate-900 border-slate-800 text-white rounded-xl focus:ring-blue-500"
                />
              </div>

              {/* TOGGLE SOMENTE COM VENCIMENTOS */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                <Switch
                  id="somenteComVencimento"
                  checked={somenteComVencimento}
                  onCheckedChange={setSomenteComVencimento}
                  className="data-[state=checked]:bg-blue-600 h-4 w-8"
                />
                <label
                  htmlFor="somenteComVencimento"
                  className="text-[11px] font-bold text-slate-300 cursor-pointer select-none"
                >
                  Ocultar vazios
                </label>
              </div>

              {/* ATUALIZAR */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-8 w-8 p-0 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                title="Recarregar"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
              <p className="text-xs font-bold text-slate-400">Calculando vencimentos dos passageiros...</p>
            </div>
          ) : dias.length === 0 ? (
            <div className="p-6">
              <AdminEmptyState
                icon={Calendar}
                title="Nenhum dia encontrado"
                description={
                  buscaDia
                    ? `Nenhum vencimento correspondente ao dia "${buscaDia}".`
                    : "Não há registros de vencimentos para os filtros selecionados."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[10px] font-headline font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Dia do Mês</th>
                    <th className="py-3 px-6 text-center">Vencimentos</th>
                    <th className="py-3 px-6">Distribuição Visual</th>
                    <th className="py-3 px-6 text-right">Proporção</th>
                    <th className="py-3 px-6 text-right">Status</th>
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
                            : item.quantidade > 0
                            ? "hover:bg-slate-900/60"
                            : "hover:bg-slate-900/30 opacity-70"
                        }`}
                      >
                        {/* DIA DO MÊS */}
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
                          </div>
                        </td>

                        {/* QUANTIDADE */}
                        <td className="py-3 px-6 text-center">
                          <span
                            className={`font-mono font-black text-sm ${
                              item.isHoje
                                ? "text-blue-400"
                                : item.quantidade > 0
                                ? "text-white"
                                : "text-slate-600"
                            }`}
                          >
                            {item.quantidade}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold ml-1">
                            {item.quantidade === 1 ? "aluno" : "alunos"}
                          </span>
                        </td>

                        {/* BARRA VISUAL */}
                        <td className="py-3 px-6 min-w-[160px]">
                          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                            <div
                              className={`h-full transition-all duration-700 rounded-full ${
                                item.isHoje
                                  ? "bg-blue-500 shadow-sm shadow-blue-500/50"
                                  : isPico
                                  ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                                  : item.quantidade > 0
                                  ? "bg-emerald-500/80"
                                  : "bg-transparent"
                              }`}
                              style={{ width: `${Math.max(item.percentual, item.quantidade > 0 ? 3 : 0)}%` }}
                            />
                          </div>
                        </td>

                        {/* PROPORÇÃO */}
                        <td className="py-3 px-6 text-right font-mono font-bold">
                          <span className={item.quantidade > 0 ? "text-slate-300" : "text-slate-600"}>
                            {item.percentual}%
                          </span>
                        </td>

                        {/* STATUS BADGE */}
                        <td className="py-3 px-6 text-right">
                          {item.isHoje ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              Em Foco Hoje
                            </span>
                          ) : isPico ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Flame className="h-2.5 w-2.5" />
                              Pico Mensal
                            </span>
                          ) : item.quantidade > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-600">
                              Sem disparos
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
