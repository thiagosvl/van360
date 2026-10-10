import {
  Calendar,
  Users,
  Flame,
  Clock,
  RotateCw,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { useLayout } from "@/contexts/LayoutContext";
import { useAdminVencimentosViewModel } from "@/hooks/ui/admin/useAdminVencimentosViewModel";

export function AdminVencimentosTabela() {
  const { openAdminVencimentoDetalhesDialog } = useLayout();
  const {
    isLoading,
    isError,
    refetch,
    somenteComVencimento,
    setSomenteComVencimento,
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <AdminKpiCard
          title="Vencimentos hoje"
          value={vencimentosHoje}
          subtext={`Dia ${diaAtual} do mês`}
          cardBorder="border-border/80"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<Clock className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Base com vencimento"
          value={totalPassageiros}
          subtext="Passageiros ativos de motoristas ativos"
          cardBorder="border-border/80"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<Users className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Dia de maior volume"
          value={diaComPico ? `Dia ${diaComPico.dia}` : "-"}
          subtext={diaComPico ? `${diaComPico.quantidade} passageiros com vencimento` : "Sem dados"}
          cardBorder="border-border/80"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<Flame className="h-5 w-5" />}
        />
      </div>

      <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Distribuição de vencimentos por dia</span>
              </CardTitle>
              <p className="text-xs font-normal text-muted-foreground mt-1">
                Acompanhamento geral de vencimentos dos alunos ativos de motoristas em atividade
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 bg-secondary/60 border border-border px-3 py-1.5 rounded-xl">
                <Switch
                  id="somenteComVencimento"
                  checked={somenteComVencimento}
                  onCheckedChange={setSomenteComVencimento}
                  className="data-[state=checked]:bg-primary shrink-0 scale-90"
                />
                <label
                  htmlFor="somenteComVencimento"
                  className="text-xs font-medium text-foreground cursor-pointer select-none whitespace-nowrap"
                >
                  Ocultar vazios
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-8 w-8 p-0 rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="Recarregar dados"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Calculando vencimentos dos passageiros...</p>
            </div>
          ) : dias.length === 0 ? (
            <div className="p-6">
              <AdminEmptyState
                icon={Calendar}
                title="Nenhum dia preenchido"
                description="Não há registros de vencimentos ativos para exibir no momento."
              />
            </div>
          ) : (
            <div>
              <div className="hidden sm:block overflow-x-auto [scrollbar-width:thin]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground">
                      <th className="py-3 px-6">Dia do Mês</th>
                      <th className="py-3 px-6 text-center">Vencimentos</th>
                      <th className="py-3 px-6">Distribuição Visual</th>
                      <th className="py-3 px-6 text-right">Proporção</th>
                      <th className="py-3 px-6 text-center w-24">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {dias.map((item) => {
                      const isPico = diaComPico && diaComPico.quantidade > 0 && item.dia === diaComPico.dia;

                      return (
                        <tr
                          key={item.dia}
                          className={`transition-colors ${
                            item.isHoje
                              ? "bg-primary/5 hover:bg-primary/10"
                              : item.quantidade > 0
                              ? "hover:bg-secondary/40"
                              : "hover:bg-secondary/20 opacity-70"
                          }`}
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-sm text-foreground">
                                Dia {item.dia.toString().padStart(2, "0")}
                              </span>
                              {item.isHoje && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground shadow-xs">
                                  <Clock className="h-2.5 w-2.5" />
                                  Hoje
                                </span>
                              )}
                              {isPico && !item.isHoje && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <Flame className="h-2.5 w-2.5" />
                                  Pico
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-6 text-center">
                            <span
                              className={`font-mono font-bold text-sm ${
                                item.isHoje
                                  ? "text-primary"
                                  : item.quantidade > 0
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {item.quantidade}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal ml-1">
                              {item.quantidade === 1 ? "aluno" : "alunos"}
                            </span>
                          </td>

                          <td className="py-3 px-6 min-w-[160px]">
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/80">
                              <div
                                className={`h-full transition-all duration-700 rounded-full ${
                                  item.isHoje
                                    ? "bg-primary shadow-xs"
                                    : isPico
                                    ? "bg-amber-400"
                                    : item.quantidade > 0
                                    ? "bg-emerald-500/80"
                                    : "bg-transparent"
                                }`}
                                style={{ width: `${Math.max(item.percentual, item.quantidade > 0 ? 3 : 0)}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-6 text-right font-mono font-semibold">
                            <span className={item.quantidade > 0 ? "text-foreground" : "text-muted-foreground"}>
                              {item.percentual}%
                            </span>
                          </td>

                          <td className="py-3 px-6 text-center">
                            <Button
                              variant="tonal"
                              size="sm"
                              onClick={() => openAdminVencimentoDetalhesDialog({ dia: item.dia })}
                              className="h-7 w-7 p-0 rounded-xl"
                              title={`Ver detalhes do Dia ${item.dia}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden p-3.5 space-y-2.5">
                {dias.map((item) => {
                  const isPico = diaComPico && diaComPico.quantidade > 0 && item.dia === diaComPico.dia;

                  return (
                    <div
                      key={`mobile-dia-${item.dia}`}
                      className={`p-3 rounded-2xl border transition-colors space-y-2 text-left ${
                        item.isHoje
                          ? "bg-primary/5 border-primary/30"
                          : item.quantidade > 0
                          ? "bg-secondary/30 border-border/80"
                          : "bg-secondary/15 border-border/40 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-xs text-foreground">
                            Dia {item.dia.toString().padStart(2, "0")}
                          </span>
                          {item.isHoje && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground shadow-xs">
                              <Clock className="h-2.5 w-2.5" />
                              Hoje
                            </span>
                          )}
                          {isPico && !item.isHoje && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Flame className="h-2.5 w-2.5" />
                              Pico
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {item.quantidade} <span className="font-normal text-[10px] text-muted-foreground">{item.quantidade === 1 ? "aluno" : "alunos"}</span>
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">({item.percentual}%)</span>
                          <Button
                            variant="tonal"
                            size="sm"
                            onClick={() => openAdminVencimentoDetalhesDialog({ dia: item.dia })}
                            className="h-6 w-6 p-0 rounded-lg ml-1"
                            title={`Ver detalhes do Dia ${item.dia}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/60">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            item.isHoje
                              ? "bg-primary shadow-xs"
                              : isPico
                              ? "bg-amber-400"
                              : item.quantidade > 0
                              ? "bg-emerald-500/80"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${Math.max(item.percentual, item.quantidade > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
