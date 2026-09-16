import React from "react";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { DollarSign, TrendingUp, Calendar, Zap, CreditCard } from "lucide-react";
import type { AdminFinancialKpis as AdminFinancialKpisType } from "@/services/api/admin/admin-financial.api";

interface AdminFinancialKpisProps {
  kpis: AdminFinancialKpisType;
}

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminFinancialKpis({ kpis }: AdminFinancialKpisProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <AdminKpiCard
        title="MRR (MENSAL RECORRENTE)"
        value={formatCurrency(kpis.mrr)}
        subtext={`ARR: ${formatCurrency(kpis.arr)} · ${kpis.totalAssinantesAtivos} pagantes (${kpis.totalMensais}M/${kpis.totalAnuais}A) + ${kpis.totalVitalicios} vit.`}
        cardBorder="border-blue-500/40 shadow-blue-500/10"
        iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <AdminKpiCard
        title="PREV. FECHAMENTO (MÊS)"
        value={formatCurrency(kpis.previsaoFechamentoMes)}
        subtext={`Realizado: ${formatCurrency(kpis.receitaRealizadaMes)} (ant: ${formatCurrency(kpis.receitaRealizadaMesAnterior)})`}
        cardBorder="border-emerald-500/40 shadow-emerald-500/10"
        iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        icon={<DollarSign className="h-5 w-5" />}
      />

      <AdminKpiCard
        title="PROJEÇÃO CAIXA PRÓX. MÊS"
        value={formatCurrency(kpis.projecaoCaixaRealProximoMes.total)}
        subtext={`Pix: ${formatCurrency(kpis.projecaoCaixaRealProximoMes.pix)} | Cartão: ${formatCurrency(kpis.projecaoCaixaRealProximoMes.cartao)}`}
        cardBorder="border-amber-500/40 shadow-amber-500/10"
        iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
        icon={<CreditCard className="h-5 w-5" />}
      />

      <AdminKpiCard
        title="CONVERSÃO DE TRIAL"
        value={`${kpis.taxaConversaoTrial}%`}
        subtext={`${kpis.trialsAtivosCount} em teste ativo (+${formatCurrency(kpis.trialsReceitaPotencial)} pot.)`}
        cardBorder="border-purple-500/40 shadow-purple-500/10"
        iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
        icon={<Zap className="h-5 w-5" />}
      />
    </div>
  );
}
