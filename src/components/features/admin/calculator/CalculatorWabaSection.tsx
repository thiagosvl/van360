import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MessageSquare } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorWabaSectionProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorWabaSection({ calcHook }: CalculatorWabaSectionProps) {
  const { simState, updateSim, calculations, formatCurrency, formatNumber } = calcHook;
  const cardStyle = "bg-card border border-border shadow-xs text-foreground rounded-xl";

  const {
    totalAlunos,
    totalMsgsWaba,
    msgsD0,
    msgsD3,
    custoWabaMensal,
    custoWabaPorAluno,
    pctWabaSobreReceita,
  } = calculations;

  return (
    <Card className={cardStyle}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-foreground font-semibold">
              Passageiros & Mensageria WABA (WhatsApp)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Régua calibrada: D-0 (Vencimento) + D+3 (Aviso de Atraso real).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-0.5">Total de Passageiros</span>
            <span className="text-lg font-bold text-white">{formatNumber(totalAlunos)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Base notificável ativa</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-0.5">Disparos WABA / Mês</span>
            <span className="text-lg font-bold text-blue-400">{formatNumber(totalMsgsWaba)} msgs</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">D-0: {msgsD0} · D+3: {msgsD3}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Taxa de Atraso no D+3 (Gatilho da Cobrança de Atraso)</span>
            <span className="text-blue-400 font-bold">{simState.inadimplenciaPct}%</span>
          </div>
          <Slider
            value={[simState.inadimplenciaPct]}
            min={10}
            max={70}
            step={2.5}
            onValueChange={([val]) => updateSim("inadimplenciaPct", val)}
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>10% (Baixo atraso)</span>
            <span className="text-slate-300">42.5% (Real da produção)</span>
            <span>70% (Alto estresse)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Custo Total WABA</span>
            <span className="text-xs font-bold text-white">{formatCurrency(custoWabaMensal)}</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Custo / Aluno</span>
            <span className="text-xs font-bold text-emerald-400">R$ {custoWabaPorAluno.toFixed(3)}</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Peso na Receita</span>
            <span className="text-xs font-bold text-blue-400">{pctWabaSobreReceita.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
