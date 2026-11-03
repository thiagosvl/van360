import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AdminMoneyInput } from "@/components/ui/admin-money-input";
import { Users } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorScaleSectionProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorScaleSection({ calcHook }: CalculatorScaleSectionProps) {
  const { simState, updateSim, calculations, formatCurrency, formatNumber } = calcHook;
  const cardStyle = "bg-card border border-border shadow-xs text-foreground rounded-xl";

  const {
    totalCondutores,
    condutoresVitalicios,
    condutoresBasePagantes,
    condutoresNovos,
    condutoresNovosMensal,
    condutoresNovosAnual,
    receitaBaseMrr,
    receitaNovosMensal,
    receitaNovosAnual,
    pAnualMensalizado,
  } = calculations;

  return (
    <Card className={cardStyle}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-foreground font-semibold">
              Escala de Condutores & Novos Assinantes
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Projeção de novos clientes sobre a base contratada atual ({formatCurrency(receitaBaseMrr)} MRR).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Total de Condutores Ativos</span>
            <span className="text-white font-bold text-sm">{totalCondutores} vans ({condutoresNovos > 0 ? `+${condutoresNovos} novas` : "Base atual"})</span>
          </div>
          <Slider
            value={[simState.nCondutores]}
            min={simState.pagantesBaseCount + simState.vitalicioCount}
            max={200}
            step={1}
            onValueChange={([val]) => updateSim("nCondutores", val)}
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Base atual ({simState.pagantesBaseCount + simState.vitalicioCount} vans)</span>
            <span>100 vans</span>
            <span>200 vans</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">Preço Mensal (Novos)</span>
            <AdminMoneyInput
              value={simState.pMensal}
              onChange={(val) => updateSim("pMensal", val)}
              className="h-8 text-sm bg-slate-900 border-slate-700 font-bold text-white"
            />
            <span className="text-[10px] text-slate-400 block">Tabela: R$ 39,90 ou R$ 69,90</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">Preço Anual (Novos)</span>
            <AdminMoneyInput
              value={simState.pAnual}
              onChange={(val) => updateSim("pAnual", val)}
              className="h-8 text-sm bg-slate-900 border-slate-700 font-bold text-white"
            />
            <span className="text-[10px] text-slate-400 block">≈ {formatCurrency(pAnualMensalizado)}/mês diluído</span>
          </div>
        </div>

        {condutoresNovos > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">% Novos no Plano Anual</span>
              <span className="text-sky-400 font-bold">{simState.anualPct}% ({condutoresNovosAnual} anuais / {condutoresNovosMensal} mensais)</span>
            </div>
            <Slider
              value={[simState.anualPct]}
              min={0}
              max={100}
              step={5}
              onValueChange={([val]) => updateSim("anualPct", val)}
            />
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Composição da Base:</span>
          <span className="text-slate-300 font-medium">
            {condutoresBasePagantes} pagantes base · {condutoresVitalicios} vitalícios {condutoresNovos > 0 ? `· +${condutoresNovos} novos` : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
