import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DollarSign, Activity, TrendingUp, Target, UserCheck, GraduationCap } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorMetricsCardsProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorMetricsCards({ calcHook }: CalculatorMetricsCardsProps) {
  const { calculations, fixosData, formatCurrency, formatPercent } = calcHook;

  const {
    receitaBrutaMensal,
    receitaAssinaturas,
    receitaSpreadCobranca,
    custosOperacionaisTotais,
    lucroLiquidoMensal,
    margemLiquidaPct,
    breakEvenCondutores,
    totalCondutores,
    totalAlunos,
    custoMedioPorCondutor,
    custoMedioPorAluno,
  } = calculations;

  const isProfit = lucroLiquidoMensal >= 0;
  const cardStyle = "bg-card border border-border shadow-xs text-foreground rounded-xl";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`${cardStyle} border-l-4 border-l-blue-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Bruta Total</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {formatCurrency(receitaBrutaMensal)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                SaaS: {formatCurrency(receitaAssinaturas)} {receitaSpreadCobranca > 0 ? `· Baixa Auto: +${formatCurrency(receitaSpreadCobranca)}` : ""}
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${cardStyle} border-l-4 border-l-orange-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custos Operacionais</span>
                <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {formatCurrency(custosOperacionaisTotais)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                Fixos ({formatCurrency(fixosData.totalFixos)}) + WABA + Gateway + Impostos
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`${cardStyle} border-l-4 ${isProfit ? "border-l-emerald-500" : "border-l-red-500"}`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro Líquido Projetado</span>
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
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={isProfit ? "default" : "destructive"}
                  className={isProfit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
                >
                  {formatPercent(margemLiquidaPct)} margem líquida
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`${cardStyle} border-l-4 border-l-slate-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ponto de Equilíbrio</span>
                <div className="p-1.5 bg-slate-500/10 text-slate-400 rounded-md border border-slate-500/20">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {breakEvenCondutores} motoristas
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                Necessários para cobrir os custos fixos ({formatCurrency(fixosData.totalFixos)})
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-300 block">Custo Operacional por Motorista</span>
              <span className="text-[11px] text-slate-400">Total de custos diluído por {totalCondutores} vans ativas</span>
            </div>
          </div>
          <span className="text-lg font-bold text-white">{formatCurrency(custoMedioPorCondutor)} <span className="text-xs font-normal text-slate-400">/mês</span></span>
        </div>

        <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-300 block">Custo Operacional por Aluno</span>
              <span className="text-[11px] text-slate-400">Infra + WABA + Gateway diluído por {totalAlunos} passageiros</span>
            </div>
          </div>
          <span className="text-lg font-bold text-white">{formatCurrency(custoMedioPorAluno)} <span className="text-xs font-normal text-slate-400">/mês</span></span>
        </div>
      </div>
    </div>
  );
}
