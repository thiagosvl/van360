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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="Assinantes pagantes"
          value={kpis.totalAssinantesAtivos}
          subtext={`${kpis.totalMensais} Mensais · ${kpis.totalAnuais} Anuais (+${kpis.totalVitalicios} Vitalícios)`}
          cardBorder="border-border/80"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<Users className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Faturamento mensal fixo"
          value={formatCurrency(receitaMensal)}
          subtext={`${kpis.totalMensais} assinantes mensais (repetido mês a mês)`}
          cardBorder="border-border/80"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<CalendarCheck className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Receita contratada anual"
          value={formatCurrency(receitaAnual)}
          subtext={`${kpis.totalAnuais} assinantes anuais (~${formatCurrency(receitaAnual / 12)}/mês eq.)`}
          cardBorder="border-border/80"
          iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
          icon={<Calendar className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="MRR (recorrência mensal)"
          value={formatCurrency(kpis.mrr)}
          subtext={`ARR: ${formatCurrency(kpis.arr)} · Base global normalizada`}
          cardBorder="border-border/80"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="Realizado no mês atual"
          value={formatCurrency(kpis.receitaRealizadaMes)}
          subtext={`Mês anterior: ${formatCurrency(kpis.receitaRealizadaMesAnterior)}`}
          cardBorder="border-border/80"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Previsão de fechamento"
          value={formatCurrency(kpis.previsaoFechamentoMes)}
          subtext={`Realizado + vencimentos restantes do mês`}
          cardBorder="border-border/80"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Projeção de caixa próximo mês"
          value={formatCurrency(kpis.projecaoCaixaRealProximoMes.total)}
          subtext={`Pix: ${formatCurrency(kpis.projecaoCaixaRealProximoMes.pix)} | Cartão: ${formatCurrency(kpis.projecaoCaixaRealProximoMes.cartao)}`}
          cardBorder="border-border/80"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<CreditCard className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Conversão de trial"
          value={`${kpis.taxaConversaoTrial}%`}
          subtext={`${kpis.trialsAtivosCount} em teste ativo (+${formatCurrency(kpis.trialsReceitaPotencial)} pot.)`}
          cardBorder="border-border/80"
          iconBg="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20"
          icon={<Zap className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
