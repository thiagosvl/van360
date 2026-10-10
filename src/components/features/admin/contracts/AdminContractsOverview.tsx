import { FileText, ShieldCheck, CheckCircle2, Clock, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { formatCurrency } from "@/utils/formatters";

interface AdminContractsOverviewProps {
  contratosStats: {
    totalContratos: number;
    contratosAssinados: number;
    contratosPendentes: number;
    contratosSubstituidos: number;
    valorTotalContratos: number;
    motoristasConfigurados?: number;
    motoristasAtivos?: number;
    motoristasConfig: {
      ativo: number;
      inativo: number;
      nao_configurado: number;
    };
  };
  totalMotoristas: number;
}

export function AdminContractsOverview({ contratosStats, totalMotoristas }: AdminContractsOverviewProps) {
  const motoristasConfigurados =
    contratosStats.motoristasConfigurados ??
    (contratosStats.motoristasConfig.ativo + contratosStats.motoristasConfig.inativo);
  const motoristasAtivos = contratosStats.motoristasAtivos ?? contratosStats.motoristasConfig.ativo;
  const baseMotoristas = totalMotoristas || 1;

  const pctConfigurados = Math.round((motoristasConfigurados / baseMotoristas) * 100);
  const pctAtivos = Math.round((motoristasAtivos / baseMotoristas) * 100);

  const taxaAssinatura =
    contratosStats.totalContratos > 0
      ? Math.round((contratosStats.contratosAssinados / contratosStats.totalContratos) * 100)
      : 0;

  const totalConfiguracoes =
    (contratosStats.motoristasConfig.ativo || 0) +
    (contratosStats.motoristasConfig.inativo || 0) +
    (contratosStats.motoristasConfig.nao_configurado || 0) || baseMotoristas;

  const pctMotoristasAtivosConfig = Math.round(((contratosStats.motoristasConfig.ativo || 0) / totalConfiguracoes) * 100);
  const pctMotoristasInativosConfig = Math.round(((contratosStats.motoristasConfig.inativo || 0) / totalConfiguracoes) * 100);
  const pctMotoristasNaoConfig = Math.round(((contratosStats.motoristasConfig.nao_configurado || 0) / totalConfiguracoes) * 100);

  return (
    <div className="space-y-6 text-left">
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-card via-card to-secondary/40 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Segurança Jurídica & Compliance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-headline font-semibold text-foreground tracking-tight">
            Volume financeiro protegido por contratos digitais
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Soma acumulada de valores contratuais vigentes com assinatura digital e validade jurídica entre motoristas e responsáveis.
          </p>
        </div>

        <div className="bg-secondary/60 border border-border/80 px-5 py-3.5 rounded-2xl shrink-0 flex flex-col items-start md:items-end justify-center">
          <span className="text-xs font-medium text-muted-foreground">Patrimônio Gerido</span>
          <span className="text-2xl sm:text-3xl font-headline font-semibold text-emerald-400">
            {formatCurrency(contratosStats.valorTotalContratos || 0)}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {contratosStats.contratosAssinados} contratos assinados ativos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="Configuração de modelo"
          value={`${motoristasConfigurados}/${totalMotoristas}`}
          subtext={`${pctConfigurados}% dos motoristas configuraram`}
          cardBorder="border-border/80"
          iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
          icon={<FileText className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Uso de contrato ativo"
          value={`${motoristasAtivos}/${totalMotoristas}`}
          subtext={`${pctAtivos}% emitem para os alunos`}
          cardBorder="border-border/80"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
          icon={<ShieldCheck className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Contratos gerados"
          value={contratosStats.totalContratos}
          subtext="Emitidos no ecossistema"
          cardBorder="border-border/80"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<Layers className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Taxa de assinatura"
          value={`${taxaAssinatura}%`}
          subtext={`${contratosStats.contratosAssinados} assinados · ${contratosStats.contratosPendentes} pendentes`}
          cardBorder="border-border/80"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card flex flex-col justify-between">
          <div>
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                <span>Funil de formalização contratual</span>
                <span className="text-xs font-mono font-medium text-emerald-400">
                  {taxaAssinatura}% de sucesso
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Contratos emitidos
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-semibold text-foreground">{contratosStats.totalContratos}</span>
                    <span className="text-muted-foreground text-[11px]">100%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/60">
                  <div className="h-full bg-primary rounded-full w-full transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Contratos assinados e válidos
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-semibold text-emerald-400">{contratosStats.contratosAssinados}</span>
                    <span className="text-emerald-400 text-[11px]">{taxaAssinatura}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${taxaAssinatura}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Aguardando assinatura do responsável
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-semibold text-amber-400">{contratosStats.contratosPendentes}</span>
                    <span className="text-amber-400 text-[11px]">
                      {contratosStats.totalContratos > 0
                        ? Math.round((contratosStats.contratosPendentes / contratosStats.totalContratos) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        contratosStats.totalContratos > 0
                          ? Math.round((contratosStats.contratosPendentes / contratosStats.totalContratos) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    Contratos aditivados ou substituídos
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-semibold text-muted-foreground">{contratosStats.contratosSubstituidos}</span>
                    <span className="text-muted-foreground text-[11px]">
                      {contratosStats.totalContratos > 0
                        ? Math.round((contratosStats.contratosSubstituidos / contratosStats.totalContratos) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-slate-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        contratosStats.totalContratos > 0
                          ? Math.round((contratosStats.contratosSubstituidos / contratosStats.totalContratos) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card flex flex-col justify-between">
          <div>
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                <span>Prontidão dos motoristas no módulo</span>
                <span className="text-xs font-mono font-normal text-muted-foreground">
                  {totalMotoristas} motoristas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-normal text-muted-foreground">Distribuição da base</span>
                  <span className="font-mono font-medium text-foreground">{pctMotoristasAtivosConfig}% prontos para envio</span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex border border-border/80">
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{ width: `${pctMotoristasAtivosConfig}%` }}
                    title={`Ativos: ${contratosStats.motoristasConfig.ativo}`}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-500"
                    style={{ width: `${pctMotoristasInativosConfig}%` }}
                    title={`Configurados Inativos: ${contratosStats.motoristasConfig.inativo}`}
                  />
                  <div
                    className="bg-muted-foreground/30 transition-all duration-500"
                    style={{ width: `${pctMotoristasNaoConfig}%` }}
                    title={`Não Configurados: ${contratosStats.motoristasConfig.nao_configurado}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-emerald-500/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-400">Configurado & Ativo</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-headline font-semibold text-foreground">
                      {contratosStats.motoristasConfig.ativo}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 ml-2">
                      {pctMotoristasAtivosConfig}%
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Modelo ativo e em emissão</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-amber-500/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-400">Pausado / Inativo</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-headline font-semibold text-foreground">
                      {contratosStats.motoristasConfig.inativo}
                    </span>
                    <span className="text-xs font-mono text-amber-400 ml-2">
                      {pctMotoristasInativosConfig}%
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Criou mas desativou</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Não Configurado</span>
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-headline font-semibold text-foreground">
                      {contratosStats.motoristasConfig.nao_configurado}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground ml-2">
                      {pctMotoristasNaoConfig}%
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Nunca editou um modelo</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
