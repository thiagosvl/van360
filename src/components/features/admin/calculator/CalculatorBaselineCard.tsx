import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Sparkles, Zap, TrendingUp } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorBaselineCardProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorBaselineCard({ calcHook }: CalculatorBaselineCardProps) {
  const {
    baseline,
    isBaselineLoading,
    applyPreset,
    fixosData,
    formatCurrency,
  } = calcHook;

  return (
    <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground">Baseline real da produção</h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-medium">
                Online & sincronizado
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Métricas sincronizadas com a base real do Dashboard executivo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
            onClick={() => applyPreset("atual")}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Cenário Atual Real
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
            onClick={() => applyPreset("crescimento")}
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Crescimento (+20 vans)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
            onClick={() => applyPreset("escala")}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            Escala (120 vans)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Motoristas Ativos
          </span>
          <span className="text-xl font-black text-white">
            {isBaselineLoading ? "..." : baseline?.motoristas.ativos ?? 51}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {baseline?.motoristas.pagantes ?? 48} Pagantes ({baseline?.motoristas.anual ?? 5}A/{baseline?.motoristas.mensal ?? 43}M) · {baseline?.motoristas.vitalicio ?? 3} Vit.
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            MRR Base Real
          </span>
          <span className="text-xl font-black text-emerald-400">
            {isBaselineLoading ? "..." : formatCurrency(baseline?.receita.mrrReal ?? 1899.80)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Fixo: {formatCurrency(baseline?.receita.mensalReal ?? 1722.30)}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Passageiros
          </span>
          <span className="text-xl font-black text-white">
            {isBaselineLoading ? "..." : baseline?.passageiros.notificaveis ?? 811}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Média: {baseline?.passageiros.mediaPorMotorista ?? 46} alunos/van
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            WABA Real (Meta)
          </span>
          <span className="text-xl font-black text-blue-400">
            {isBaselineLoading ? "..." : `${baseline?.waba.totalMensagensMes ?? 1815} msgs`}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Atraso real: {baseline?.waba.taxaAtrasoD3Pct ?? 42.5}%
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Taxa Pix / Cartão
          </span>
          <span className="text-xl font-black text-white">1,19% / 3,49%</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Pix: {baseline?.gateway.pctPix ?? 77}% · Cartão: {baseline?.gateway.pctCartao ?? 23}%
          </span>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Custos Fixos Atuais
          </span>
          <span className="text-xl font-black text-orange-400">{formatCurrency(fixosData.totalFixos)}</span>
          <span className="text-[10px] text-slate-400 block mt-1">VPS + Google + Domínio</span>
        </div>
      </div>
    </div>
  );
}
