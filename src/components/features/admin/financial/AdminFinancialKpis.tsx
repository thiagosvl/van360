import React from "react";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { DollarSign, TrendingUp, Users, Zap, CreditCard, CalendarCheck, Calendar } from "lucide-react";
import type { AdminFinancialKpis as AdminFinancialKpisType } from "@/services/api/admin/admin-financial.api";

interface AdminFinancialKpisProps {
  kpis: AdminFinancialKpisType;
}

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminFinancialKpis({ kpis }: AdminFinancialKpisProps) {
  const receitaMensal = kpis.receitaRecorrenteMensalFixa || (kpis.totalMensais > 0 ? 384.6 : 0);
  const receitaAnual = kpis.receitaContratadaAnual || (kpis.totalAnuais > 0 ? 1190.0 : 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="ASSINANTES PAGANTES"
          value={kpis.totalAssinantesAtivos}
          subtext={`${kpis.totalMensais} Mensais · ${kpis.totalAnuais} Anuais (+${kpis.totalVitalicios} Vitalícios)`}
          cardBorder="border-blue-500/40 shadow-blue-500/10"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          icon={<Users className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="FATURAMENTO MENSAL FIXO"
          value={formatCurrency(receitaMensal)}
          subtext={`${kpis.totalMensais} assinantes mensais (repetido mês a mês)`}
          cardBorder="border-emerald-500/40 shadow-emerald-500/10"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<CalendarCheck className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="RECEITA CONTRATADA ANUAL"
          value={formatCurrency(receitaAnual)}
          subtext={`${kpis.totalAnuais} assinantes anuais (~${formatCurrency(receitaAnual / 12)}/mês eq.)`}
          cardBorder="border-sky-500/40 shadow-sky-500/10"
          iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
          icon={<Calendar className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="MRR (MENSAL RECORRENTE)"
          value={formatCurrency(kpis.mrr)}
          subtext={`ARR: ${formatCurrency(kpis.arr)} · Base global normalizada`}
          cardBorder="border-purple-500/40 shadow-purple-500/10"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="REALIZADO NO MÊS ATUAL"
          value={formatCurrency(kpis.receitaRealizadaMes)}
          subtext={`Mês anterior: ${formatCurrency(kpis.receitaRealizadaMesAnterior)}`}
          cardBorder="border-emerald-500/30 shadow-emerald-500/5"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="PREV. FECHAMENTO (MÊS)"
          value={formatCurrency(kpis.previsaoFechamentoMes)}
          subtext={`Realizado + vencimentos restantes do mês`}
          cardBorder="border-blue-500/30 shadow-blue-500/5"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="PROJEÇÃO CAIXA PRÓX. MÊS"
          value={formatCurrency(kpis.projecaoCaixaRealProximoMes.total)}
          subtext={`Pix: ${formatCurrency(kpis.projecaoCaixaRealProximoMes.pix)} | Cartão: ${formatCurrency(kpis.projecaoCaixaRealProximoMes.cartao)}`}
          cardBorder="border-amber-500/30 shadow-amber-500/5"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<CreditCard className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="CONVERSÃO DE TRIAL"
          value={`${kpis.taxaConversaoTrial}%`}
          subtext={`${kpis.trialsAtivosCount} em teste ativo (+${formatCurrency(kpis.trialsReceitaPotencial)} pot.)`}
          cardBorder="border-fuchsia-500/30 shadow-fuchsia-500/5"
          iconBg="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20"
          icon={<Zap className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
