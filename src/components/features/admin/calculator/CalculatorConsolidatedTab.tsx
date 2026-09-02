import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  Percent,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
} from "lucide-react";

export function CalculatorConsolidatedTab({ calcHook }: { calcHook: any }) {
  const {
    simState,
    updateSim,
    calculations,
    projectionChartData,
  } = calcHook;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const {
    receitaBrutaMensal,
    receitaNovosMensal,
    receitaNovosAnual,
    receitaFundadores,
    custoGateway,
    impostoSimples,
    custoWabaMensal,
    custoWabaPorCondutor,
    custosVariaveisTotais,
    margemContribuicao,
    margemContribuicaoPct,
    custosOperacionaisTotais,
    lucroLiquidoMensal,
    margemLiquidaPct,
    breakEvenCondutores,
    totalMsgsWaba,
    ltv,
    ltvToCac,
    totalFixos,
    insights,
  } = calculations;

  const isProfit = lucroLiquidoMensal >= 0;
  const cardStyle = "bg-[#131b2e] border border-slate-800/80 shadow-2xl text-slate-100 rounded-[1.5rem]";

  return (
    <div className="space-y-8">
      {/* 1. Hero KPIs Consolidados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`${cardStyle} border-l-4 border-l-blue-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MRR Projetado (Bruto)</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {formatCurrency(receitaBrutaMensal)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                ARR: <strong className="text-blue-400">{formatCurrency(receitaBrutaMensal * 12)}</strong>
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${cardStyle} border-l-4 border-l-purple-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Margem de Contribuição</span>
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {formatCurrency(margemContribuicao)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {margemContribuicaoPct.toFixed(1)}% após WABA + Gateway + Imposto
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`${cardStyle} border-l-4 ${isProfit ? "border-l-emerald-500" : "border-l-red-500"}`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro Líquido Operacional</span>
                <div
                  className={`p-1.5 rounded-md border ${
                    isProfit
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className={`text-2xl lg:text-3xl font-black tracking-tight ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(lucroLiquidoMensal)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {formatCurrency(lucroLiquidoMensal * 12)} anual líquido ({margemLiquidaPct.toFixed(1)}%)
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`${cardStyle} border-l-4 border-l-slate-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LTV / CAC Estimado</span>
                <div className="p-1.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {ltvToCac > 0 ? `${ltvToCac.toFixed(1)}x` : "—"}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                LTV: {formatCurrency(ltv)} · CAC: {formatCurrency(simState.cac)}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 2. Insights & Diagnóstico Estratégico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights?.map((ins: any) => (
          <div
            key={ins.id}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between ${
              ins.tipo === "sucesso"
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : ins.tipo === "alerta"
                ? "bg-orange-950/20 border-orange-500/30 text-orange-300"
                : ins.tipo === "estrategia"
                ? "bg-purple-950/20 border-purple-500/30 text-purple-300"
                : "bg-blue-950/20 border-blue-500/30 text-blue-300"
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {ins.tipo === "sucesso" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {ins.tipo === "alerta" && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                {ins.tipo === "estrategia" && <Lightbulb className="w-4 h-4 text-purple-400" />}
                {ins.tipo === "info" && <Info className="w-4 h-4 text-blue-400" />}
                <h4 className="font-bold text-xs text-white tracking-tight">{ins.titulo}</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{ins.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. DRE Projetado em Cascata */}
      <Card className={cardStyle}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-base font-bold text-white">Demonstrativo de Resultados (DRE Mensal Projetado)</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Abertura analítica de receitas brutas, custos variáveis unitários e custos fixos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Receita Bruta */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-sm text-white">(+) Receita Bruta Total</span>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Faturamento SaaS</Badge>
                </div>
                <span className="text-base font-black text-white">{formatCurrency(receitaBrutaMensal)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <div>
                  Plano Mensal (Novos): <strong className="text-slate-200">{formatCurrency(receitaNovosMensal)}</strong>
                </div>
                <div>
                  Plano Anual (Novos diluído): <strong className="text-slate-200">{formatCurrency(receitaNovosAnual)}</strong>
                </div>
                <div>
                  Fundadores Promoção: <strong className="text-slate-200">{formatCurrency(receitaFundadores)}</strong>
                </div>
              </div>
            </div>

            {/* Custos Variáveis */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-headline font-bold text-sm text-orange-400">(-) Custos Variáveis Diretos</span>
                <span className="text-sm font-black text-orange-400">-{formatCurrency(custosVariaveisTotais)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">Gateway (Pix 1,19% / Cartão 3,49%)</span>
                  <span className="text-sm font-bold text-white">-{formatCurrency(custoGateway)}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">Imposto Simples Nacional (6%)</span>
                  <span className="text-sm font-bold text-white">-{formatCurrency(impostoSimples)}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    WABA ({totalMsgsWaba.toLocaleString("pt-BR")} disparos Meta)
                  </span>
                  <span className="text-sm font-bold text-orange-400">-{formatCurrency(custoWabaMensal)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ≈ {formatCurrency(custoWabaPorCondutor)} / motorista
                  </span>
                </div>
              </div>
            </div>

            {/* Margem de Contribuição */}
            <div className="bg-purple-950/20 border border-purple-800/40 p-3.5 rounded-xl flex justify-between items-center">
              <span className="font-headline font-black text-sm text-purple-300">(=) Margem de Contribuição</span>
              <div className="text-right">
                <span className="text-base font-black text-purple-300">{formatCurrency(margemContribuicao)}</span>
                <span className="text-[11px] text-purple-400 block">{margemContribuicaoPct.toFixed(1)}% da receita</span>
              </div>
            </div>

            {/* Custos Fixos */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-headline font-bold text-sm text-slate-300">(-) Custos Fixos Operacionais</span>
                <span className="text-xs text-slate-400 block mt-0.5">VPS + Google Workspace + Domínio + Upgrades Ativos</span>
              </div>
              <span className="text-sm font-black text-slate-300">-{formatCurrency(totalFixos)}</span>
            </div>

            {/* Lucro Líquido Final */}
            <div
              className={`p-4 rounded-xl border flex justify-between items-center ${
                isProfit ? "bg-emerald-950/30 border-emerald-500/40" : "bg-red-950/30 border-red-500/40"
              }`}
            >
              <div>
                <span className="font-headline font-black text-base text-white">(=) Lucro Líquido Mensal</span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Margem Líquida: <strong className={isProfit ? "text-emerald-400" : "text-red-400"}>{margemLiquidaPct.toFixed(1)}%</strong>
                </span>
              </div>
              <span className={`text-xl font-black ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(lucroLiquidoMensal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Gráfico de Projeção em 12 Meses */}
      <Card className={cardStyle}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-bold text-white">Curva de Crescimento Projetada (12 Meses)</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Simulação de expansão com crescimento mensal de {simState.growPct}% e churn de {simState.churnPct}%.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-64">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Taxa Crescimento:</span>
            <Slider
              value={[simState.growPct]}
              min={1}
              max={20}
              step={1}
              onValueChange={([val]) => updateSim("growPct", val)}
            />
            <span className="text-xs font-bold text-white min-w-[2.5rem]">{simState.growPct}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mes" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem" }}
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value)),
                    name === "Receita Bruta" ? "Receita Bruta" : "Lucro Líquido"
                  ]}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="receitaBruta"
                  name="Receita Bruta"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                />
                <Area
                  type="monotone"
                  dataKey="lucroLiquido"
                  name="Lucro Líquido"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLucro)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
